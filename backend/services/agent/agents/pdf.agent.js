import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"

export const pdfAgent = async (state) => {
    try {
        const llm = await getModel("pdf")

        const prompt = `
You are an expert document writer.

Write the ACTUAL CONTENT of the document the user asks for.
Do NOT write a description of the document, how to use it, or study tips about it.
Ignore words like "pdf", "document" or "generate" in the request. They only say the output format.
Example: for "indian states and capitals pdf", list the real states and their real capitals.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
"title":"",
"subtitle":"",
"sections":[
{
"heading":"",
"points":[]
}
]
}

Rules:
- Generate 3-8 sections.
- Use as many points per section as the content needs (lists can be long).
- Each point must be real, factual content, for example "Maharashtra - Mumbai".
- Group long lists logically, for example by region.

User request:
${state.prompt}
`

        const res = await llm.invoke(prompt)
       //console.log("1. llm raw response received")

        const raw = String(res.content)
            .trim()
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/, "")
            .trim()

        const data = JSON.parse(raw)
       // console.log("2. parsed document, sections:", data.sections?.length)

        const pdfBuffer = await generatePdf(data)
       // console.log("3. pdf generated, bytes:", pdfBuffer.length)

        const filename = `pdf-${Date.now()}.pdf`
        await uploadToS3(filename, pdfBuffer, "application/pdf")
       // console.log("4. uploaded to S3:", filename)

        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)
       // console.log("5. signed url ready")

        return {
    ...state,
    aiResponse: `# PDF Generated

**${data.title}**

📥 [Download PDF](${downloadUrl})

_Link expires in 24 hours._`
}
    } catch (error) {
        console.log("pdf agent error:", error.message)
        return {
            aiResponse: "Failed to generate the document. Please try again."
        }
    }
}