import axios from "axios"
import { graph } from "../graph/graph.js"
import { getMemory, addMessage } from "../config/memory.js"

export const agent = async (req, res) => {
  try {
    const file = req.file
   
    const { prompt, conversationId, agent: selectedAgent } = req.body
    const userId = req.headers["x-user-id"]

    if (!prompt || !conversationId) {
      return res.status(400).json({ message: "prompt and conversationId are required" })
    }

    const headers = { "x-user-id": userId }
    const url = `${process.env.CHAT_SERVICE}/save-message`

    const previous = await getMemory(conversationId, userId)

    await addMessage(conversationId, "user", prompt)
    const history = [...previous, { role: "user", content: prompt }]

    await axios.post(
      url,
      { conversationId, role: "user", content: prompt },
      { headers }
    )

    const result = await graph.invoke({
      prompt,
      conversationId,
      history,
      agent: selectedAgent || "auto",
      userId,
      file
    })

    const response = result.aiResponse
    const images = result.images || []
    const artifacts = result.artifacts || []

    await addMessage(conversationId, "assistant", response)

    await axios.post(
      url,
      { conversationId, role: "assistant", content: response, images, artifacts },
      { headers }
    )

    return res.status(200).json({ response, images, artifacts })
  } catch (error) {
    
      console.error("AGENT ERROR:", error.message)

    
    return res.status(500).json({ message: `agent error ${error.message}` })
  }
}