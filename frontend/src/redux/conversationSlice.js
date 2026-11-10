import { createSlice } from "@reduxjs/toolkit"

const conversationSlice = createSlice({
  name: "conversation",

  initialState: {
    conversations: [],
    selectedConversation: null
  },

  reducers: {
    // set all conversations from backend
    setConversations: (state, action) => {
      state.conversations = action.payload || []
    },

    // add a new conversation at the top of the list
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload)
    },

    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload
    },

    // update the title in the list and in the selected conversation
    setConvTitle: (state, action) => {
      const { title, conversationId } = action.payload

      const conv = state.conversations.find((c) => c && c._id === conversationId)
      if (conv) conv.title = title

      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation.title = title
      }
    }
  }
})

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConvTitle
} = conversationSlice.actions

export default conversationSlice.reducer