import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Code2, FileText, Globe, ImageIcon, MessagesSquare, Mic, Paperclip, Presentation, Send, Zap } from 'lucide-react'
import sendMessage from '../features/sendMessage'
import { createConversation } from '../features/createConversation'
import { updateConversation } from '../features/updateConversation'
import { addMessage, setArtifacts } from '../redux/messageSlice'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { useRef } from 'react'

// ids must match the names used by the router / graph on the backend
const agents = [
  { id: 'auto', icon: Zap, label: 'Auto' },
  { id: 'chat', icon: MessagesSquare, label: 'Chat' },
  { id: 'coding', icon: Code2, label: 'Coding' },
  { id: 'pdf', icon: FileText, label: 'PDF' },
  { id: 'ppt', icon: Presentation, label: 'PPT' },
  { id: 'vision', icon: ImageIcon, label: 'Vision' },
  { id: 'search', icon: Globe, label: 'Search' },
]

const ChatInput = () => {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('auto')
  const dispatch = useDispatch()
  const { selectedConversation } = useSelector((state) => state.conversation)
  const [selectedFile,setselectedFile]=useState(null)
  const fileRef=useRef(null)
  const handleSendMessage = async () => {
    const prompt = value.trim()
    if (!prompt || loading) return

    setLoading(true)
    setValue('')

    try {
      let conversation = selectedConversation
      const title = prompt.slice(0, 50)

      if (!conversation?._id) {
        const created = await createConversation()

        if (!created?._id) {
          console.log('create conversation failed')
          return
        }

        conversation = { ...created, title }

        dispatch(addConversation(conversation))
        dispatch(setSelectedConversation({ ...conversation, isNew: true }))
        updateConversation({ id: created._id, title })
      } else if (conversation.title === 'New Chat') {
        dispatch(setConvTitle({ conversationId: conversation._id, title }))
        updateConversation({ id: conversation._id, title })
        conversation = { ...conversation, title }
      }

      dispatch(addMessage({
        _id: `local-${Date.now()}`,
        role: 'user',
        content: prompt
      }))
console.log(selectedFile)
const formData=new FormData()
formData.append("prompt",value.trim())
formData.append("conversationId",conversation?._id)
formData.append("agent",selectedAgent.toLowerCase())
formData.append("file",selectedFile)

      const data = await sendMessage(formData)
     

      if (!data) {
        console.log('no response from agent')
        return
      }

      if (data.artifacts?.length > 0) {
        dispatch(setArtifacts(data.artifacts))
      }

      dispatch(
        addMessage({
          _id: `local-${Date.now()}-ai`,
          role: 'assistant',
          content: data.response || data.reply || data.content || '',
          images: data.images || [],
          artifacts: data.artifacts || [],
        })
      )
    } catch (error) {
      console.log('send message error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="w-full overflow-hidden px-2 md:px-5 py-3 md:py-4 border-t border-white/[0.06] bg-[#0d0f14] shrink-0">
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-3 md:px-4 pt-3 md:pt-3.5 pb-3">

        <div className="flex w-full gap-1.5 md:gap-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.id
            const Icon = agent.icon

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full border text-[11px] md:text-[12px] font-medium cursor-pointer transition-all duration-150
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-700 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,0.4)]'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:bg-white/[0.07] hover:text-slate-200'}`}
              >
                <Icon size={13} />
                {agent.label}
              </button>
            )
          })}
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask Anything..."
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e)=>{
              const file=e.target.files[0]
              if(file)
              {
                  setselectedFile(file)
              }
              
            }}/>
            <button
              onClick={()=>fileRef.current.click()}
              type="button"
              aria-label="Attach file"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              aria-label="Voice input"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer"
            >
              <Mic size={16} />
            </button>
          </div>

          <button
            type="button"
            aria-label="Send message"
            onClick={handleSendMessage}
            disabled={!value.trim() || loading}
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput