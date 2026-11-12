import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BillingDrawer from './BillingDrawer'
import api from '../../utils/axios'
import { setMessages, setArtifacts } from '../redux/messageSlice'


import {
    Coins,
    LogOut,
    MessageSquare,
    PanelLeftIcon,
    PanelRight,
    PenSquare,
    Plus,
    User
} from 'lucide-react'

import { getConversations } from '../features/getConversations'
import { createConversation } from '../features/createConversation'

import {
    addConversation,
    setConversations,
    setSelectedConversation,
} from '../redux/conversationSlice'

import { setUserdata } from '../redux/userSlice'
import logOut from '../features/logOut'

const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false)

    const dispatch = useDispatch()

    const { userData } = useSelector((state) => state.user)
    const { conversations, selectedConversation } = useSelector((state) => state.conversation)

    const [imageError, setImageError] = useState(false)

    const [showbilling, setShowbilling] = useState(false)
    const userKey = userData?._id || userData?.userId || userData?.email

    useEffect(() => {
        if (!userData) {
            dispatch(setConversations([]))
            return
        }

        const getConv = async () => {
            const data = await getConversations()
            dispatch(setConversations(data || []))
        }

        getConv()
    }, [dispatch, userKey])

    useEffect(() => {
        setImageError(false)
    }, [userData?.avatar])

    const handleCreateConversation = async () => {
        const data = await createConversation()

        if (data) {
            dispatch(addConversation(data))
            dispatch(setSelectedConversation(data))
        }
    }

    const handleLogout = () => {
        logOut()
        dispatch(setUserdata(null))
        dispatch(setConversations([]))
        dispatch(setSelectedConversation(null))
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
    }

    const handleBuyPlan = async (planId) => {
        try {
            const { data } = await api.post('/api/payment/create-order', { plan: planId })

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'NexusAI',
                description: `${data.plan.name} plan`,
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        await api.post('/api/billing/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        dispatch(setUserdata({
                            ...userData,
                            plan: planId,
                            credits: (userData?.credits || 0) + data.plan.credits,
                            totalCredits: (userData?.totalCredits || 0) + data.plan.credits,
                        }))
                        setShowbilling(false)
                    } catch (error) {
                        console.log('verify payment error:', error)
                    }
                },
            }

            new window.Razorpay(options).open()
        } catch (error) {
            console.log('buy plan error:', error)
        }
    }

    const planName = userData?.plan || 'free'
    const planLabel = `${planName.charAt(0).toUpperCase()}${planName.slice(1)} Plan`

    if (collapsed) {
        return (
            <div className="hidden md:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0">

                <button
                    type="button"
                    aria-label="Expand sidebar"
                    onClick={() => setCollapsed(false)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer mb-1"
                >
                    <PanelRight size={20} />
                </button>

                <button
                    type="button"
                    aria-label="New chat"
                    onClick={handleCreateConversation}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-white bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 transition-opacity duration-150 cursor-pointer mb-1"
                >
                    <Plus size={16} />
                </button>

                <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {(conversations || []).filter(Boolean).map((conv) => {
                        const isActive = selectedConversation?._id === conv._id

                        return (
                            <button
                                key={conv._id}
                                type="button"
                                title={conv.title || 'New chat'}
                                aria-label={conv.title || 'New chat'}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-xl border transition-colors duration-150 cursor-pointer
                                    ${isActive
                                        ? 'bg-indigo-500/10 border-indigo-500/[0.18] text-indigo-400'
                                        : 'bg-transparent border-transparent text-slate-500 hover:bg-white/[0.05] hover:text-indigo-400'}`}
                            >
                                <MessageSquare size={14} />
                            </button>
                        )
                    })}
                </div>

                <div className="mt-2">
                    {userData?.avatar && !imageError ? (
                        <img
                            src={userData.avatar}
                            alt={userData.name}
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-slate-400">
                            <User size={16} />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed md:static inset-y-0 left-0 z-50 w-[230px] lg:w-[270px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06]">

            <div className="flex flex-col h-full min-h-0">

                {/* header */}
                <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06] shrink-0">

                    <button
                        type="button"
                        aria-label="Collapse sidebar"
                        onClick={() => setCollapsed(true)}
                        className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
                    >
                        <PanelLeftIcon size={20} />
                    </button>

                    <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1 truncate">
                        NexusAI
                    </span>

                    <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
                        {planName}
                    </span>

                    <button
                        type="button"
                        aria-label="New chat"
                        onClick={handleCreateConversation}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
                    >
                        <PenSquare size={14} />
                    </button>

                </div>

                {/* new chat button */}
                <div className="px-4 pt-4 pb-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => dispatch(setSelectedConversation(null))}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] cursor-pointer hover:opacity-90 transition-opacity duration-150"
                    >
                        <Plus size={15} />
                        New Chat
                    </button>
                </div>

                {/* label */}
                <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600 shrink-0">
                    {conversations.length === 0 ? 'No recent conversations' : 'Recents'}
                </div>

                {/* list */}
                <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                    {(conversations || []).filter(Boolean).map((conv) => {
                        const isActive = selectedConversation?._id === conv._id

                        return (
                            <div
                                key={conv._id}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                className={`group flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150
                                    ${isActive
                                        ? 'bg-indigo-500/10 border-indigo-500/[0.18]'
                                        : 'bg-transparent border-transparent hover:bg-white/[0.04]'}`}
                            >

                                <div
                                    className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-colors duration-150
                                        ${isActive
                                            ? 'bg-indigo-500/15 text-indigo-400'
                                            : 'bg-white/[0.05] text-slate-500 group-hover:bg-indigo-500/15 group-hover:text-indigo-400'}`}
                                >
                                    <MessageSquare size={13} />
                                </div>

                                <span
                                    className={`flex-1 min-w-0 truncate text-[13px] transition-colors duration-150
                                        ${isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-100'}`}
                                >
                                    {conv.title || 'New chat'}
                                </span>

                            </div>
                        )
                    })}

                </div>

                <div className="mx-2.5 h-px bg-white/[0.06] shrink-0" />

                <div className="px-3.5 py-3.5 shrink-0">

                    {userData ? (
                        <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors duration-150">

                            <div className="relative shrink-0">

                                {userData.avatar && !imageError ? (
                                    <img
                                        src={userData.avatar}
                                        alt={userData.name}
                                        referrerPolicy="no-referrer"
                                        onError={() => setImageError(true)}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                    </div>
                                )}

                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d0f14]" />

                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="truncate text-[13px] font-medium text-slate-100">
                                    {userData?.name || "user"}
                                </p>

                                <p className="truncate text-[11px] text-slate-500">
                                    {userData.email}
                                </p>

                                <p className="truncate text-[11px] text-slate-500">
                                    {planLabel}
                                </p>
                            </div>

                            <div className="flex gap-1 shrink-0">

                                <button
                                    onClick={() => setShowbilling(true)}
                                    type="button"
                                    aria-label="Credits"
                                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150"
                                >
                                    <Coins size={16} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Log out"
                                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                </button>

                            </div>

                        </div>
                    ) : (
                        <button>Login</button>
                    )}

                </div>

            </div>

            <BillingDrawer
                open={showbilling}
                onClose={() => setShowbilling(false)}
                onSelectPlan={handleBuyPlan}
            />



        </div>
    )
}

export default SideBar