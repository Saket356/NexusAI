import axios from "axios"

export const getMessages = async (conversationId, userId) => {
  try {
    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE}/get-messages/${conversationId}`,
      { headers: { "x-user-id": userId } }
    )
    return data
  } catch (error) {
    console.log("get messages failed:", error.response?.status, error.response?.data || error.message)
    return []
  }
}