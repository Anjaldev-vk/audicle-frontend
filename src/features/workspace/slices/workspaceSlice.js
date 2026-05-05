import { createSlice } from '@reduxjs/toolkit'

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    activeWorkspaceId: localStorage.getItem('activeWorkspaceId') || null,
    workspaces: [],
  },
  reducers: {
    setActiveWorkspaceId: (state, action) => {
      state.activeWorkspaceId = action.payload
      if (action.payload) {
        localStorage.setItem('activeWorkspaceId', action.payload)
      } else {
        localStorage.removeItem('activeWorkspaceId')
      }
    },
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload
    },
    clearWorkspace: (state) => {
      state.activeWorkspaceId = null
      state.workspaces = []
      localStorage.removeItem('activeWorkspaceId')
    },
  },
})

export const { setActiveWorkspaceId, setWorkspaces, clearWorkspace } = workspaceSlice.actions
export default workspaceSlice.reducer

export const selectActiveWorkspaceId = (state) => state.workspace.activeWorkspaceId
export const selectWorkspaces = (state) => state.workspace.workspaces
export const selectActiveWorkspace = (state) => 
  state.workspace.workspaces.find(w => w.id === state.workspace.activeWorkspaceId) || null


