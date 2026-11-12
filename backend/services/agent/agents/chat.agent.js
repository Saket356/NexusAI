import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const chatAgent = async (state) => {
  try {
    
    const llm = await getModel("chat")

    const baseSystemPrompt = `
You are NexusAI, an intelligent AI assistant.
Rules:
- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean markdown.

Formatting rules (your replies are rendered as Markdown):

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with a language tag for code, for example \`\`\`js.
- Use \`inline code\` for commands, file names and variables.
- Use **bold** for key terms, sparingly.
- Use tables only when comparing items.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
- For simple greetings or short questions, reply in one or two plain sentences without headings.
`

    // only added when the search agent ran before this node
    let searchContext = ""
    const hasSearch = Array.isArray(state.searchResults)
      ? state.searchResults.length > 0
      : Boolean(state.searchResults)

    if (hasSearch) {
      const formatted =
        typeof state.searchResults === "string"
          ? state.searchResults
          : JSON.stringify(state.searchResults, null, 2)

      searchContext = `

Web search results:
${formatted}

Answer the user's question using only the search results above.
End with a short conclusion.
`
    }

    const messages = [new SystemMessage(baseSystemPrompt + searchContext)]

    const history = state.history || []

    history.forEach((msg) => {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content))
      }
      if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content))
      }
    })

    const response = await llm.invoke(messages)
     await deductCredits(state.userId,"chat")

    return {
      aiResponse: response.content,
    }
  } catch (error) {
    console.log("chat agent error:", error.message)
    return {
      aiResponse: "Something went wrong while generating the response. Please try again.",
    }
  }
}