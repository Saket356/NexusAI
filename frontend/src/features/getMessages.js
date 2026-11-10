import api from "../../utils/axios"

async function getMessages(id) {
  try {
    const { data } = await api.get(`/api/chat/get-messages/${id}`)
    console.log(data)
    return data
  } catch (error) {
    console.log(error.response?.data || error.message)
    return []
  }
}

export default getMessages