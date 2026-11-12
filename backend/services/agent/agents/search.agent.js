import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"
export const searchAgent = async (state) => {
    try {
       
        const raw = await searchTool.invoke({ query: state.prompt })
         await deductCredits(state.userId,"search")
        console.log("tavily:", raw)

        // some versions return { error } instead of throwing
        if (!raw || raw.error) {
            return { searchResults: [], images: [] }
        }

        const searchResults = (raw.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            content: r.content,
        }))

        return {
            searchResults,
            images: raw.images || [],
        }
    } catch (error) {
        console.log("search error:", error.message)
        return { searchResults: [], images: [] }
    }
}