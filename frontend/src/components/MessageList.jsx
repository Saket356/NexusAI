import React from 'react'
import { useSelector } from 'react-redux'
import { MessageSquare } from 'lucide-react'
import MessageBubble from './MessageBubble'

const MessageList = () => {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { messages } = useSelector((state) => state.message)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 md:px-6 py-4 md:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 shadow-lg shadow-indigo-500/20">
              <MessageSquare size={22} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight bg-gradient-to-br from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              NexusAI
            </h1>
            <p className="text-sm text-slate-500">How can I help you today?</p>
            <p className="max-w-xs text-[13px] leading-relaxed text-slate-600">
              Ask me anything — code, ideas, explanations, or just a quick question.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {["Write a Netflix clone", "Explain Redis", "Build a dashboard"].map((s) => (
              <button
                key={s}
                type="button"
                className="text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          {messages.map((msg) => (
            <div key={msg._id}>
              <MessageBubble role={msg?.role} content={msg?.content} images={msg.images || []} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageList