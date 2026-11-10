import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

const TTL = 60 * 60 * 24
const MAX_MESSAGES = 20

export const getMemory = async (conversationId, userId) => {
  const key = `messages-${conversationId}`

  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)
  } catch (error) {
    console.log("memory read failed:", error.message)
  }

  const messages = await getMessages(conversationId, userId)
  const trimmed = messages
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content }))

  if (trimmed.length > 0) {
    try {
      await redis.set(key, JSON.stringify(trimmed), "EX", TTL)
    } catch (error) {
      console.log("memory write failed:", error.message)
    }
  }

  return trimmed
}

export const saveMemory = async (conversationId, messages) => {
  try {
    const trimmed = messages.slice(-MAX_MESSAGES)
    await redis.set(`messages-${conversationId}`, JSON.stringify(trimmed), "EX", TTL)
  } catch (error) {
    console.log("memory save failed:", error.message)
  }
}

export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`

  try {
    const rawMessages = await redis.get(key)
    const messages = rawMessages ? JSON.parse(rawMessages) : []

    messages.push({ role, content })

    while (messages.length > MAX_MESSAGES) {
      messages.shift()
    }

    await redis.set(key, JSON.stringify(messages), "EX", TTL)
  } catch (error) {
    console.log("add memory failed:", error.message)
  }
}