import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import redis from "../../../shared/redis/redis.js"
import crypto from "crypto"
export const login = async (req, res) => {
    try {
        //received from frontend
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)
        let user = await User.findOne({
            firebaseUID: decoded.uid
        })

        if (!user) {
            user = await User.create({
                firebaseUID: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionID = crypto.randomUUID()
        await redis.set(`session-${sessionID}`, JSON.stringify({
            userID: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpiresAt: user.planExpiresAt
        }), "EX", 7 * 24 * 60 * 60)
        await redis.set(`user-session-${user._id}`, sessionID, "EX", 7 * 24 * 60 * 60)


        res.cookie("session", sessionID, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000

        })
        //sent to frontend
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `login error ${error}` })

    }
}

export const logout = async (req, res) => {
    try {
        const sessionID = req.cookies?.session
        await redis.del(`session-${sessionID}`)

        res.clearCookie("session")
        return res.status(200).json({ message: "logout successfully" })

    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}



export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId } = req.body

        if (!plan || !credits || !userId) {
            return res.status(400).json({ message: "plan, credits and userId are required" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.plan = plan
        user.credits += credits
        user.totalCredits += credits
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await user.save()

        const sessionId = req.cookies?.session
        

        if (sessionId) {
            await redis.set(
                `session-${sessionId}`,
                JSON.stringify({
                    userID: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    plan: user.plan,
                    credits: user.credits,
                    totalCredits: user.totalCredits,
                    planExpiresAt: user.planExpiresAt
                }),
                "EX",
                7 * 24 * 60 * 60
            )
        }

        return res.status(200).json({ message: "User payment updated", credits: user.credits })
    } catch (error) {
        console.log("update user payment error:", error.message)
        return res.status(500).json({ message: `Update user payment error: ${error.message}` })
    }
}




export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      vision: 10
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const requiredCredits = COST[agent] || 1;

    if (user.credits < requiredCredits) {
      return res.status(400).json({
        message: "Not enough credits."
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    const sessionId = await redis.get(`user-session-${user._id}`)

if (sessionId) {
  await redis.set(
    `session-${sessionId}`,
    JSON.stringify({
      userID: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planExpiresAt: user.planExpiresAt
    }),
    "EX",
    7 * 24 * 60 * 60
  )
}
    console.log(user.credits)
    return res.status(200).json({ success: true ,credits:user.credits});

  } catch (error) {
    console.log("deduct credits error:", error.message);
    return res.status(500).json({
      message: error.message
    });
  }
}
