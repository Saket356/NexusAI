import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
dotenv.config()

const port =process.env.PORT
const app=express()

app.use(express.json())
app.use(cookieParser()) 
app.use("/",router)

app.get("/",(req,res)=>{
    res.json({message:"auth is running"})
})

app.listen(port,()=>{
    console.log(` auth running at port ${port} `)
    connectDB()
})

