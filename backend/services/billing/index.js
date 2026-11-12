import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/billing.routes.js"

dotenv.config()

const port =process.env.PORT
const app=express()
app.use(express.json())
app.use("/",router)

app.get("/",(req,res)=>{
    res.json({message:"billing service is running"})
})

app.listen(port,()=>{
    console.log(` billing service running at port ${port} `)
    connectDB()
})

