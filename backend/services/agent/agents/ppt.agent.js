import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
export const pptAgent = async (state) => {
    try {
       
        const llm = await getModel("ppt")

        const prompt = `
You are a professional presentation designer.

Write the ACTUAL CONTENT of the presentation the user asks for.
Ignore words like "ppt", "presentation", "slides" or "generate" in the request. They only say the output format.

Return ONLY valid JSON.

Format:

{
    "title": "",
    "subtitle": "",
    "slides": [
        {
            "title": "",
            "points": []
        }
    ]
}

Rules:
- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- Each point must be real, factual content.
- No markdown.
- No explanation.
- No code block.

Topic:
${state.prompt}
`

        const res = await llm.invoke(prompt)
          await deductCredits(state.userId,"ppt")
        console.log("1. llm response received")

        const raw = String(res.content)
            .trim()
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/, "")
            .trim()

        const data = JSON.parse(raw)
        console.log("2. parsed presentation, slides:", data.slides?.length)

        const pptBuffer = await generatePpt(data)
        console.log("3. ppt generated, bytes:", pptBuffer.length)

        const filename = `ppt-${Date.now()}.pptx`
        await uploadToS3(
            filename,
            pptBuffer,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
        console.log("4. uploaded to S3:", filename)

        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)
        console.log("5. signed url ready")

        return {
            aiResponse: `# PPT Generated

**${data.title}**

${data.slides?.length || 0} slides

📥 [Download PPT](${downloadUrl})

_Link expires in 24 hours._`
        }
    } catch (error) {
        console.log("ppt agent error:", error.message)
        return {
            aiResponse: "Failed to generate the presentation. Please try again."
        }
    }
}