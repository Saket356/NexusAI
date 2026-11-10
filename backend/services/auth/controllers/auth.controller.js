import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import redis from "../../../shared/redis/redis.js"

export const login = async(req,res)=>{
    try {
        //received from frontend
        const {token} =req.body
        const decoded=await getAuth(app).verifyIdToken(token)
       let user = await User.findOne({
            firebaseUID:decoded.uid
        })

        if(!user)
        {
            user = await User.create({
                firebaseUID:decoded.uid,
                name:decoded.name,
                email:decoded.email,
                avatar:decoded.picture
            })
        }

        const sessionID=crypto.randomUUID()
        await redis.set(`session-${sessionID}`,JSON.stringify({
            userID:user._id,
            name:user.name,
            email:user.email,
            avatar:user.avatar
        }),"EX",7*24*60*60)


        res.cookie("session",sessionID,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000

        })
        //sent to frontend
         return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
        
    }
}

export const logout= async(req,res)=>{
    try {
        const sessionID=req.cookies?.session
        await redis.del(`session-${sessionID}`)

        res.clearCookie("session")
        return res.status(200).json({message:"logout successfully"})

    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
    }
}