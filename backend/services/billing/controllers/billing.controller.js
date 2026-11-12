import crypto from "crypto"
import axios from "axios"
import { PLANS } from "../config/plans.js"
import razorpay from "../config/razorpay.js"
import payment from "../models/payment.model.js"
import dotenv from "dotenv"
dotenv.config()
export const getPlans = async (req, res) => {
    const plans = Object.values(PLANS).filter((p) => p.amount > 0)
    return res.status(200).json(plans)
}

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const userId = req.headers["x-user-id"]

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const selectedPlan = PLANS[plan?.toLowerCase()]
        if (!selectedPlan || selectedPlan.amount <= 0) {

            return res.status(404).json({ message: "plan not found" })
        }

        const order = await razorpay.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `receipt-${Date.now()}`
        })

        await payment.create({
            userId,
            orderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            plan: selectedPlan.id,
            currency: order.currency,
            status: "created"
        })

        return res.status(200).json({ order, plan: selectedPlan })
    } catch (error) {
        console.log("create order error:", error)
        return res.status(500).json({
            message: `create order error ${error?.error?.description || error.message}`
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body
        const userId = req.headers["x-user-id"]


        if (!userId) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {

            return res.status(400).json({ message: "Missing payment details" })
        }



        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")


        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({ message: "Payment verification failed" })
        }


        const record = await payment.findOneAndUpdate(
            { orderId: razorpay_order_id, userId, status: "created" },
            { status: "paid", paymentId: razorpay_payment_id },
            { returnDocument: "after" }
        )


        if (!record) {

            return res.status(404).json({ message: "Order not found or already processed" })
        }


        const authRes = await axios.post(
            `${process.env.AUTH_SERVICE}/update-plan`,
            {
                userId: record.userId,
                plan: record.plan,
                credits: record.credits,
                validity: PLANS[record.plan]?.validity || 30
            },
            { headers: { cookie: req.headers.cookie || "" } }
        )


        console.log("Payment verified successfully")
        return res.status(200).json({
            message: "Payment verified successfully",
            credits: record.credits
        })
    } catch (error) {

        return res.status(500).json({ message: `Verify payment error: ${error.message}` })
    }
}