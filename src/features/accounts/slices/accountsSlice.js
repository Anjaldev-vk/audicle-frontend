import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  organisation: null,
  members: [],
  invites: [],
  auditLogs: [],
}

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setOrganisation: (state, action) => {
      state.organisation = action.payload
    },
    setMembers: (state, action) => {
      state.members = action.payload
    },
    setInvites: (state, action) => {
      state.invites = action.payload
    },
    setAuditLogs: (state, action) => {
      state.auditLogs = action.payload
    },
  },
})

export const { setOrganisation, setMembers, setInvites, setAuditLogs } = accountsSlice.actions
export default accountsSlice.reducer
