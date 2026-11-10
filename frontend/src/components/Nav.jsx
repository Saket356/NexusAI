import React from 'react'
import { useSelector } from 'react-redux'
import { MessageSquare } from 'lucide-react'

const Nav = () => {
    const { selectedConversation } = useSelector((state) => state.conversation)
    const { messages } = useSelector((state) => state.message)

    if (!selectedConversation) return null

    return (
        <div className="h-14 flex items-center gap-2.5 px-3 md:px-5 border-b border-white/[0.06] bg-[#0d0f14] shrink-0">
            <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400">
                <MessageSquare size={14} />
            </div>

            <div className="min-w-0 truncate text-sm font-medium text-slate-100">
                {selectedConversation.title || "New Chat"}
            </div>

            <div className="shrink-0 whitespace-nowrap text-[10px] font-medium text-slate-500 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full">
                {messages?.length || 0} {messages?.length === 1 ? "Message" : "Messages"}
            </div>
        </div>
    )
}

export default Nav