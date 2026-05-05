import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isSidebarOpen: true,
    activeModals: {},
    rateLimitMessage: null,
    unreadNotificationCount: 0,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    showModal: (state, action) => {
      state.activeModals[action.payload] = true
    },
    hideModal: (state, action) => {
      state.activeModals[action.payload] = false
    },
    showRateLimitToast: (state, action) => {
      state.rateLimitMessage = action.payload
    },
    clearRateLimitToast: (state) => {
      state.rateLimitMessage = null
    },
    setUnreadCount: (state, action) => {
      state.unreadNotificationCount = action.payload
    },
    incrementUnreadCount: (state) => {
      state.unreadNotificationCount += 1
    },
  },
})

export const { 
  toggleSidebar, 
  showModal, 
  hideModal, 
  showRateLimitToast, 
  clearRateLimitToast,
  setUnreadCount,
  incrementUnreadCount
} = uiSlice.actions

export default uiSlice.reducer

export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen
export const selectActiveModals = (state) => state.ui.activeModals
export const selectRateLimitMessage = (state) => state.ui.rateLimitMessage
export const selectUnreadCount = (state) => state.ui.unreadNotificationCount
