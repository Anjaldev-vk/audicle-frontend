import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  chatHistory: [],
  currentSessionId: null,
  isStreaming: false,
}

const ragSlice = createSlice({
  name: 'rag',
  initialState,
  reducers: {
    setChatHistory: (state, action) => {
      state.chatHistory = action.payload
    },
    addMessage: (state, action) => {
      state.chatHistory.push(action.payload)
    },
    setCurrentSessionId: (state, action) => {
      state.currentSessionId = action.payload
    },
    setStreaming: (state, action) => {
      state.isStreaming = action.payload
    },
  },
})

export const { setChatHistory, addMessage, setCurrentSessionId, setStreaming } = ragSlice.actions
export default ragSlice.reducer
