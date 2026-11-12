import fs from "fs"
import { PDFParse } from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { vectorStore } from "../config/vectorDb.js"
import { deductCredits } from "../utils/deductCredits.js"

export const pdfRag = async (state) => {
    try {
        if (!state.file?.path) {
            return {
                ...state,
                aiResponse: "Please attach a PDF first."
            }
        }

        const buffer = fs.readFileSync(state.file.path)
        const pdf = new PDFParse({
            data: buffer
        })

        const result = await pdf.getText()
        const text = result.text

        if (!text || !text.trim()) {
            return {
                ...state,
                aiResponse: "I couldn't read any text from this PDF. It may be a scanned image. Try uploading it as an image instead."
            }
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        })

        const docs = await splitter.createDocuments([text])
        const collectionName = `pdf-${Date.now()}`
        const store = await vectorStore(docs, collectionName)

        const results = await store.similaritySearch(state.prompt, 4)
        const context = results.map((r) => r.pageContent).join("\n\n")

        const llm = await getModel("pdf")

        const messages = [
            new SystemMessage(`You are CortexAI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.

- Never make up information.

- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.
`),
            new HumanMessage(`
Context:${context}

Question:${state.prompt}
`)
        ]

        const response = await llm.invoke(messages)

        const aiText = typeof response.content === "string"
            ? response.content
            : response.content.map((p) => p.text || "").join("")

        await deductCredits(state.userId, "pdf")

        return {
            ...state,
            aiResponse: aiText
        }

    } catch (error) {
        console.log("pdf rag error:", error.message)
        return {
            ...state,
            aiResponse: "Failed to Analyze pdf"
        }
    } finally {
        if (state.file?.path && fs.existsSync(state.file.path)) {
            fs.unlinkSync(state.file.path)
        }
    }
}