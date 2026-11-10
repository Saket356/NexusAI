import { getModel } from "../config/llmModels.js"

// models sometimes wrap JSON in code fences or add stray text
const parseFiles = (text) => {
    const files = []
    const re = /<<<FILE:\s*(.+?)\s*>>>\r?\n([\s\S]*?)\r?\n?<<<END>>>/g

    let match
    while ((match = re.exec(String(text))) !== null) {
        const name = match[1].trim()
        const content = match[2]
            .replace(/^```[a-z]*\r?\n/i, "")
            .replace(/\r?\n```\s*$/, "")

        if (name && content.trim()) files.push({ name, content })
    }

    return files
}

export const codingAgent = async (state) => {
    try {
        // Step 1: classify the request
        const intentLlm = await getModel("intent")

        const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
  `)

        // normalize so "code_generation." or " CODE_GENERATION\n" still match
        const intent = String(intentRes.content)
            .trim()
            .toUpperCase()
            .replace(/[^A-Z_]/g, "")

        console.log("Detected Intent:", intent)

        const llm = await getModel("coding")

        // Step 2a: generate a project as files
        if (intent === "CODE_GENERATION") {
            const prompt = `
You are NexusAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested by the user.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.
- Keep the code complete but compact. No placeholder comments like "add more here".
- index.html must link style.css and script.js.

Output format (strict):
Write each file in this exact format, with raw code and nothing else.
No JSON, no markdown, no code fences, no explanation.

<<<FILE: index.html>>>
(full file content)
<<<END>>>
<<<FILE: style.css>>>
(full file content)
<<<END>>>
<<<FILE: script.js>>>
(full file content)
<<<END>>>

User Request:
${state.prompt}
`

            const res = await llm.invoke(prompt)
            const files = parseFiles(res.content)
            console.log("coding output length:", String(res.content).length)
            console.log("finish reason:", res.response_metadata?.finishReason || res.response_metadata?.finish_reason)

            if (!files || files.length === 0) {
                console.log("coding agent: could not parse files")
                return {
                    aiResponse: "I couldn't generate the code properly. Please try again.",
                    artifacts: [],
                }
            }

            return {
                aiResponse: "Code generated successfully.",
                artifacts: [
                    {
                        id: String(Date.now()),
                        type: "project",
                        files,
                        title: state.prompt
                    },
                ],
            }
        }

        // Step 2b: every other intent (review, explain, debug, ...) gets a markdown answer
        const result = await llm.invoke(`
The user's intent is: ${intent}

Answer the user's request below.
Return Markdown only.
Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

Skip any heading that doesn't apply.

User Request:
${state.prompt}
  `)

        return {
            aiResponse: result.content,
            artifacts: [],
        }
    } catch (error) {
        console.log("coding agent error:", error.message)
        return {
            aiResponse: "Something went wrong while generating the code. Please try again.",
            artifacts: [],
        }
    }
}