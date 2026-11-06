import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import { connect } from "mongoose"
dotenv.config()

const port =process.env.PORT

const app=express()


app.get("/",(req,res)=>{
    res.json({message:"auth is running"})
})

app.listen(port,()=>{
    console.log(` auth running at port ${port} `)
    connectDB()
})

