import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Coins, Check, Crown } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setUserdata } from '../redux/userSlice'
import api from '../../utils/axios'
import { createOrder } from '../features/createOrder'
import { verifyPayment } from '../features/verifyPayment'

function BillingDrawer({ open, onClose, onSelectPlan }) {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open || plans.length > 0) return

        const fetchPlans = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/api/billing/plans')
                setPlans(Array.isArray(data) ? data : [])
            } catch (error) {
                console.log('fetch plans error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [open, plans.length])

    const handleUpgrade = async (plan) => {
        try {
            console.log("sending plan:", plan)
            const data = await createOrder(plan)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data?.order?.amount,
                currency: data?.order?.currency,
                name: "NexusAI",
                description: `${data?.plan?.name} Plan`,
                order_id: data?.order?.id,
                handler: async (response) => {
                    try {
                        // 1. verify the payment on the server
                        const verifyData = await verifyPayment(response)
                        console.log("verify response:", verifyData)

                        // 2. reload the latest user (plan + credits) from the server
                        const { data: me } = await api.get('/api/me')
                        console.log("me response:", me)

                        // 3. update Redux so the drawer shows the new plan and credits
                        // if /api/me returns { user: {...} }, use me.user instead of me
                        dispatch(setUserdata(me))

                        // 4. close the drawer
                        onClose()
                    } catch (error) {
                        console.log(error)
                    }
                },
                theme: {
                    color: "#4F46E5"
                }
            }
            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.25 }}
                        className="fixed right-0 top-0 z-50 h-screen w-full max-w-[380px] bg-[#0f1117] border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        <div className="h-14 px-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-slate-100 text-sm font-semibold">
                                <Coins size={16} className="text-yellow-600" />
                                Billing
                            </div>
                            <button
                                type="button"
                                aria-label="Close billing"
                                onClick={onClose}
                                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] bg-transparent border-none cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-400 text-sm">Current Plan</p>
                                        <h3 className="text-white text-xl font-bold capitalize">
                                            {userData?.plan || 'free'}
                                        </h3>
                                    </div>
                                    <Crown className="text-yellow-500" size={22} />
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/[0.07]">
                                    <p className="text-[11px] uppercase tracking-widest text-slate-500">Credits</p>
                                    <p className="text-2xl font-semibold text-slate-100 mt-1">
                                        {userData?.credits ?? 0}
                                    </p>
                                    {userData?.planExpiresAt && (
                                        <p className="text-[12px] text-slate-500 mt-1">
                                            Expires {new Date(userData.planExpiresAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {loading && <p className="text-sm text-slate-500">Loading plans...</p>}

                            {!loading && plans.length === 0 && (
                                <p className="text-sm text-slate-500">No plans available right now.</p>
                            )}

                            {plans.map((p) => (
                                <div key={p.id} className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 flex flex-col gap-3">
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
                                        <span className="text-lg font-semibold text-indigo-400">₹{p.amount}</span>
                                    </div>

                                    <ul className="flex flex-col gap-1.5">
                                        {[`${p.credits} credits`, 'All agents', `${p.validity} days validity`].map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-[12.5px] text-slate-400">
                                                <Check size={13} className="text-emerald-500 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        onClick={() => handleUpgrade(p.name)}
                                        className="w-full py-2 rounded-lg text-[13px] font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 border-none cursor-pointer transition-opacity"
                                    >
                                        Upgrade to {p.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default BillingDrawer