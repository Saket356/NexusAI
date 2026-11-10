import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"

const getUserId = (req) => req.headers["x-user-id"]

export const createConversation = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const conversation = await Conversation.create({ userId })
    return res.status(201).json(conversation)
  } catch (error) {
    return res.status(500).json({ message: `Create conversation error: ${error}` })
  }
}

export const getConversations = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 })
    return res.status(200).json(conversations)
  } catch (error) {
    return res.status(500).json({ message: `Get conversations error: ${error}` })
  }
}

export const updateConversation = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { id, title } = req.body
    const conversation = await Conversation.findOneAndUpdate(
  { _id: id, userId },
  { title },
  { returnDocument: "after" }
)
    if (!conversation) return res.status(404).json({ message: "Conversation not found" })

    return res.status(200).json(conversation)
  } catch (error) {
    return res.status(500).json({ message: `Update conversation error: ${error}` })
  }
}

export const saveMessage = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { conversationId, role, content, images, artifacts } = req.body

    const conversation = await Conversation.findOne({ _id: conversationId, userId })
    if (!conversation) return res.status(404).json({ message: "Conversation not found" })

    const message = await Message.create({ conversationId, role, content, images, artifacts })
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() })

    return res.status(201).json(message)
  } catch (error) {
    return res.status(500).json({ message: `Save message error: ${error}` })
  }
}

export const getMessages = async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { conversationId } = req.params

    const conversation = await Conversation.findOne({ _id: conversationId, userId })
    if (!conversation) return res.status(404).json({ message: "Conversation not found" })

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 })
    return res.status(200).json(messages)
  } catch (error) {
    return res.status(500).json({ message: `Get messages error: ${error}` })
  }
}