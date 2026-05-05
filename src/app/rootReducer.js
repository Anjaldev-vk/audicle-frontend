import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/slices/authSlice'
import workspaceReducer from '../features/workspace/slices/workspaceSlice'
import meetingsReducer from '../features/meetings/slices/meetingsSlice'
import ragReducer from '../features/rag/slices/ragSlice'
import accountsReducer from '../features/accounts/slices/accountsSlice'
import uiReducer from './uiSlice'
import { baseApi } from '../services/baseApi'

const rootReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  meetings: meetingsReducer,
  rag: ragReducer,
  accounts: accountsReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
})

export default rootReducer
