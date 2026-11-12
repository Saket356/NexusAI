import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
export const visionAgent = async (state) => {
    try {
       
        const llm = await getModel("image")
        const res = await llm.invoke(
            `
You are an elite AI image prompt engineer.

Convert the user request into a detailed image generation prompt.

Requirements:
- Cinematic lighting
- Professional composition
- High detail
- Beautiful color palette
- Sharp focus
- Photorealistic
-Depth of field
-Stunning Visuals
-Professional Photography

Return only the image prompt

User Request:
${state.prompt}
        `
        )

        const prompt = res.content.trim()
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
       // console.log(imageUrl)
        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
          await deductCredits(state.userId,"vision")
        const buffer = Buffer.from(imageRes.data)
        //console.log(buffer)
        const filename = `image-${Date.now()}.png`

        await uploadToS3(filename, buffer, "image/png")
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)

        return {
            ...state,
            aiResponse: `
# 🖼️ Image Generated Successfully

![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

⏳ Link expires in 10 minutes.
`
        }
    } catch (error) {
        console.log("vision agent error:", error.response?.status, error.message)
        return {
            ...state,
            aiResponse: "Failed to generate image"
        }
    }
}