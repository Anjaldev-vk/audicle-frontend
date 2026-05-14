import { createSlice } from '@reduxjs/toolkit'

const loadPersistedWorkspace = () => {
  try {
    const stored = localStorage.getItem('activeWorkspace')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    activeWorkspace: loadPersistedWorkspace(),
    // Kept for backwards compat — selectActiveWorkspaceId still works
    activeWorkspaceId: localStorage.getItem('activeWorkspaceId') || null,
    workspaces: [],
  },
  reducers: {
    /**
     * Full workspace switch — stores the entire workspace object.
     * This is the primary action to dispatch when switching workspaces.
     */
    switchWorkspace: (state, action) => {
      const ws = action.payload // { id, name, type, role, plan }
      state.activeWorkspace = ws
      state.activeWorkspaceId = ws?.id ?? null

      if (ws) {
        localStorage.setItem('activeWorkspace', JSON.stringify(ws))
        if (ws.id) {
          localStorage.setItem('activeWorkspaceId', ws.id)
        } else {
          localStorage.removeItem('activeWorkspaceId')
        }
      } else {
        localStorage.removeItem('activeWorkspace')
        localStorage.removeItem('activeWorkspaceId')
      }
    },

    /** Legacy — kept for backward compat with existing call sites */
    setActiveWorkspaceId: (state, action) => {
      state.activeWorkspaceId = action.payload
      // Also try to resolve the full object from workspaces[]
      const found = state.workspaces.find(w => w.id === action.payload)
      if (found) {
        state.activeWorkspace = {
          id: found.id ?? null,
          name: found.name,
          type: found.type,
          role: found.role ?? null,
          plan: found.plan ?? 'free',
        }
        localStorage.setItem('activeWorkspace', JSON.stringify(state.activeWorkspace))
      }
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
      state.activeWorkspace = null
      state.activeWorkspaceId = null
      state.workspaces = []
      localStorage.removeItem('activeWorkspace')
      localStorage.removeItem('activeWorkspaceId')
    },
  },
})

export const {
  switchWorkspace,
  setActiveWorkspaceId,
  setWorkspaces,
  clearWorkspace,
} = workspaceSlice.actions

export default workspaceSlice.reducer

// ── Selectors ───────────────────────────────────────
export const selectActiveWorkspaceId = (state) =>
  state.workspace.activeWorkspaceId

export const selectWorkspaces = (state) =>
  state.workspace.workspaces

export const selectActiveWorkspace = (state) =>
  state.workspace.activeWorkspace

/** Derived role of the current user in the active workspace */
export const selectWorkspaceRole = (state) =>
  state.workspace.activeWorkspace?.role ?? null

/** Convenience boolean selectors for RBAC guards */
export const selectIsOwner = (state) =>
  state.workspace.activeWorkspace?.role === 'owner'

export const selectIsAdmin = (state) => {
  const role = state.workspace.activeWorkspace?.role
  return role === 'owner' || role === 'admin'
}

export const selectWorkspacePlan = (state) =>
  state.workspace.activeWorkspace?.plan ?? 'free'
