import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosInstance, { setInMemoryToken } from '../../../services/axiosInstance'

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
      const accessToken = refreshRes.data.data.access
      setInMemoryToken(accessToken)
      
      // get user profile
      const meRes = await axiosInstance.get('accounts/me/')
      return { user: meRes.data.data, accessToken }
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
      
      if (response.data.data.mfa_required) {
        return { mfaRequired: true, mfaToken: response.data.data.mfa_token }
      }

      const { user, tokens } = response.data.data
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

      if (response.data.data.mfa_required) {
        return { mfaRequired: true, mfaToken: response.data.data.mfa_token }
      }

      const { user, tokens } = response.data.data
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
      const { user, tokens } = response.data.data
      setInMemoryToken(tokens.access)
      return { user, accessToken: tokens.access }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Registration failed' }
      )
    }
  }
)

// MFA Verification
export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async ({ mfaToken, totpCode }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/mfa/verify/', {
        mfa_token: mfaToken,
        totp_code: totpCode,
      })
      const { user, access_token } = response.data.data
      setInMemoryToken(access_token)
      return { user, accessToken: access_token }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'MFA verification failed' }
      )
    }
  }
)

// MFA Recovery - Step 1: Request OTP
export const requestMFARecovery = createAsyncThunk(
  'auth/requestMFARecovery',
  async ({ mfaToken }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/mfa/recover/request/', {
        mfa_token: mfaToken,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to request recovery code' }
      )
    }
  }
)

// MFA Recovery - Step 2: Verify OTP
export const verifyMFARecovery = createAsyncThunk(
  'auth/verifyMFARecovery',
  async ({ mfaToken, emailCode }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('accounts/mfa/recover/verify/', {
        mfa_token: mfaToken,
        email_code: emailCode,
      })
      const { user, access_token } = response.data.data
      setInMemoryToken(access_token)
      return { user, accessToken: access_token }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Recovery verification failed' }
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
    mfaRequired: false,
    mfaToken:    null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    logout: (state) => {
      state.user        = null
      state.accessToken = null
      state.error       = null
      state.mfaRequired = false
      state.mfaToken    = null
    },
    clearError: (state) => {
      state.error = null
    },
    resetMFA: (state) => {
      state.mfaRequired = false
      state.mfaToken    = null
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
      if (action.payload.mfaRequired) {
        state.mfaRequired = true
        state.mfaToken    = action.payload.mfaToken
        state.user        = null
        state.accessToken = null
      } else {
        state.user        = action.payload.user
        state.accessToken = action.payload.accessToken
        state.mfaRequired = false
        state.mfaToken    = null
      }
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
      if (action.payload.mfaRequired) {
        state.mfaRequired = true
        state.mfaToken    = action.payload.mfaToken
        state.user        = null
        state.accessToken = null
      } else {
        state.user        = action.payload.user
        state.accessToken = action.payload.accessToken
        state.mfaRequired = false
        state.mfaToken    = null
      }
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

    // ── verifyMFA ─────────────────────────────
    builder.addCase(verifyMFA.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(verifyMFA.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.mfaRequired = false
      state.mfaToken    = null
      state.isLoading   = false
      state.error       = null
    })
    builder.addCase(verifyMFA.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── requestMFARecovery ─────────────────────
    builder.addCase(requestMFARecovery.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(requestMFARecovery.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(requestMFARecovery.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── verifyMFARecovery ─────────────────────
    builder.addCase(verifyMFARecovery.pending, (state) => {
      state.isLoading = true
      state.error     = null
    })
    builder.addCase(verifyMFARecovery.fulfilled, (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.mfaRequired = false
      state.mfaToken    = null
      state.isLoading   = false
      state.error       = null
    })
    builder.addCase(verifyMFARecovery.rejected, (state, action) => {
      state.isLoading = false
      state.error     = action.payload
    })

    // ── logout ────────────────────────────────
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user        = null
      state.accessToken = null
      state.error       = null
      state.mfaRequired = false
      state.mfaToken    = null
    })
  },
})

export const { setAccessToken, logout, clearError, resetMFA } = authSlice.actions
export default authSlice.reducer

// selectors
export const selectUser        = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsLoading   = (state) => state.auth.isLoading
export const selectIsAuthReady = (state) => state.auth.isAuthReady
export const selectError       = (state) => state.auth.error
export const selectIsLoggedIn  = (state) => !!state.auth.user
export const selectMfaRequired = (state) => state.auth.mfaRequired
export const selectMfaToken    = (state) => state.auth.mfaToken

