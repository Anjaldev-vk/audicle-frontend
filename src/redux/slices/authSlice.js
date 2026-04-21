import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosInstance, { setInMemoryToken } from '../../api/axiosInstance'

const API_URL = import.meta.env.VITE_API_URL

// ─────────────────────────────────────────────
// Async thunks
// ─────────────────────────────────────────────

// check session on app load
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      // attempt to get new access token using refresh cookie
      const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'
      const refreshRes = await axios.post(
        `${API_URL}/api/${API_VERSION}/accounts/token/refresh/`,
        {},
        { withCredentials: true }
      )
      const accessToken = refreshRes.data.access
      setInMemoryToken(accessToken)

      // get user profile
      const meRes = await axiosInstance.get('accounts/me/')
      return { user: meRes.data, accessToken }
    } catch {
      return rejectWithValue(null)
    }
  }
)

// normal login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/login/', {
        email,
        password,
      })
      const { user, tokens } = response.data
      setInMemoryToken(tokens.access)
      return { user, accessToken: tokens.access }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      )
    }
  }
)

// Google OAuth login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/login/google/', {
        token: googleToken,
      })
      const { user, tokens } = response.data
      setInMemoryToken(tokens.access)
      return { user, accessToken: tokens.access }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Google login failed' }
      )
    }
  }
)

// register
export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/register/', payload)
      const { user, tokens } = response.data
      setInMemoryToken(tokens.access)
      return { user, accessToken: tokens.access }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Registration failed' }
      )
    }
  }
)

// logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await axiosInstance.post('accounts/logout/')
    } catch {
      // still clear state even if request fails
    } finally {
      setInMemoryToken(null)
    }
  }
)

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    accessToken: null,
    isLoading:   true,  // true on first load for session check
    isAuthReady: false, // true after checkSession completes
    error:       null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    logout: (state) => {
      state.user        = null
      state.accessToken = null
      state.error       = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {

    // ── checkSession ──────────────────────────
    builder.addCase(checkSession.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isLoading   = false
      state.isAuthReady = true
    })
    builder.addCase(checkSession.rejected, (state) => {
      state.user        = null
      state.accessToken = null
      state.isLoading   = false
      state.isAuthReady = true
    })

    // ── login ─────────────────────────────────
    builder.addCase(login.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isLoading   = false
      state.error       = null
    })
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── googleLogin ───────────────────────────
    builder.addCase(googleLogin.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(googleLogin.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isLoading   = false
      state.error       = null
    })
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── register ──────────────────────────────
    builder.addCase(register.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(register.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isLoading   = false
      state.error       = null
    })
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── logout ────────────────────────────────
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user        = null
      state.accessToken = null
      state.error       = null
    })
  },
})

export const { setAccessToken, logout, clearError } = authSlice.actions
export default authSlice.reducer

// selectors
export const selectUser        = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsLoading   = (state) => state.auth.isLoading
export const selectIsAuthReady = (state) => state.auth.isAuthReady
export const selectError       = (state) => state.auth.error
export const selectIsLoggedIn  = (state) => !!state.auth.user