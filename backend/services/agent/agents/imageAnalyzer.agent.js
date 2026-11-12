import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import fs from "fs"
import { deductCredits } from "../utils/deductCredits.js"
import dotenv from "dotenv"
dotenv.config()
export const imageAnalyzer = async (state) => {
    try {
const llm = await getModel("imageAnalyzer");



const test = await llm.invoke("Reply with only OK");



        const imageBuffer = fs.readFileSync(state.file.path)
const base64Image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(
                `You are CortexAI image analyzer Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
`
            ),
            new HumanMessage(
                {
                    content: [
                        {
                            type: "text",
                            text: state.prompt || "analyze the image"
                        },
                        {
                            type: "image_url",
                            "image_url": {
                                url: `data:${state.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            )
        ]
     
        const response = await llm.invoke(messages, { signal: AbortSignal.timeout(30000) })
         
        deductCredits(state.userId,"vision")
        return {
            ...state,
            aiResponse:response.content
        }

    } catch (error) {
        console.log(`error reading file -${error}`)
         return {
            ...state,
            aiResponse:"failed to analyze file"
        }
    }
    finally{
        fs.unlinkSync(state.file.path)
    }
}