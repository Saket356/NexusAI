import { createSlice } from "@reduxjs/toolkit"

const messageSlice = createSlice({
  name: "message",

  initialState: {
    messages: [],
    artifacts: [],
  },

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload || []

      const last = [...state.messages].reverse().find((m) => m?.artifacts?.length > 0)
      state.artifacts = last?.artifacts || []
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setArtifacts: (state, action) => {
      state.artifacts = action.payload || []
    },
  },
})

export const { setMessages, addMessage, setArtifacts } = messageSlice.actions

export default messageSlice.reducer