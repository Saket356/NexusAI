import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/chat.routes.js"

dotenv.config()

const port = process.env.PORT

const app = express()

app.use(express.json())

// Register routes
app.use("/", router)

app.get("/", (req, res) => {
    res.json({ message: "chat service is running" })
})

app.listen(port, () => {
    console.log(`Chat service is running at port ${port}`)
    connectDB()
})