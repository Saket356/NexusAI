import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import getMessages from '../features/getMessages'
import { setMessages } from '../redux/messageSlice'

function ChatArea() {
  const dispatch = useDispatch()
  const { selectedConversation } = useSelector((state) => state.conversation)

  useEffect(() => {
    const getMesg = async () => {
      if (!selectedConversation?._id) {
        dispatch(setMessages([]))
        return
      }
      if (selectedConversation.title === "New Chat") return
      if (selectedConversation.isNew) return

      const data = await getMessages(selectedConversation._id)
      dispatch(setMessages(data))
    }
    getMesg()
  }, [selectedConversation?._id, dispatch])

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  )
}

export default ChatArea