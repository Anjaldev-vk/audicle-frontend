import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  meetings: [],
  activeMeetingId: null,
  filters: {
    status: 'all',
    search: '',
  },
}

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setMeetings: (state, action) => {
      state.meetings = action.payload
    },
    setActiveMeeting: (state, action) => {
      state.activeMeetingId = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
})

export const { setMeetings, setActiveMeeting, setFilters } = meetingsSlice.actions
export default meetingsSlice.reducer
