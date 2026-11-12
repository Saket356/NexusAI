import axios from "axios"

export const deductCredits = async (userId, agent) => {
  try {
    const { data } = await axios.post(
      `${process.env.AUTH_SERVICE}/deduct-credits`,
      { userId, agent }
    )
    return { success: true, ...data }
  } catch (error) {
    console.log("deduct credits failed:", error.response?.status, error.response?.data || error.message)
    return { success: false, message: error.response?.data?.message || "Could not deduct credits" }
  }
}