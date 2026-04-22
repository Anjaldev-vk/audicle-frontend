import axios from 'axios'
import axiosInstance, { setInMemoryToken } from './axiosInstance'

const API_URL = import.meta.env.VITE_API_URL
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

export const setupInterceptors = (store) => {
  // ─────────────────────────────────────────────
  // Request interceptor
  // Attach access token to every request
  // ─────────────────────────────────────────────
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // ─────────────────────────────────────────────
  // Response interceptor
  // On 401 — attempt token refresh then retry
  // ─────────────────────────────────────────────
  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // Log errors
      const status = error.response?.status || 'NETWORK_ERROR'
      const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN'
      const url = originalRequest?.url || 'UNKNOWN'
      const data = error.response?.data || error.message

      console.error(
        `%c 🔴 [API ERROR] ${status} | ${method} ${url} `,
        'background: #222; color: #ff5555; font-weight: bold; padding: 2px 4px; border-radius: 4px;',
        data
      )

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return axiosInstance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const response = await axios.post(
            `${API_URL}/api/${API_VERSION}/accounts/token/refresh/`,
            {},
            { withCredentials: true }
          )

          const newAccessToken = response.data.access
          setInMemoryToken(newAccessToken)

          // Update Redux - use literal type to avoid importing authSlice
          store.dispatch({ type: 'auth/setAccessToken', payload: newAccessToken })

          processQueue(null, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axiosInstance(originalRequest)

        } catch (refreshError) {
          processQueue(refreshError, null)
          setInMemoryToken(null)
          store.dispatch({ type: 'auth/logout' })
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )
}
