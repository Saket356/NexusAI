import "dotenv/config"
import { QdrantClient } from "@qdrant/js-client-rest"

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
})

console.log("typeof getCollections:", typeof client.getCollections)

try {
    const res = await client.getCollections()
    console.log("OK collections:", res.collections.length)
} catch (error) {
    console.log("ERROR:", error.message)
}