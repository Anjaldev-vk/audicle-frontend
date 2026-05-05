import axios from 'axios'

// in-memory access token
let inMemoryAccessToken = null

export const setInMemoryToken = (token) => {
  inMemoryAccessToken = token
}

export const getInMemoryToken = () => inMemoryAccessToken

const API_URL = import.meta.env.VITE_API_URL
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}/`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setupInterceptors = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const isAuthPath = config.url.includes('accounts/login/') || config.url.includes('accounts/register/')
      const token = store.getState().auth.accessToken
      if (token && !isAuthPath) {
        config.headers.Authorization = `Bearer ${token}`
      }
      const workspaceId = store.getState().workspace.activeWorkspaceId
      if (workspaceId) {
        config.headers['X-Workspace-ID'] = workspaceId
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error)
      else prom.resolve(token)
    })
    failedQueue = []
  }

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
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
          const newAccessToken = response.data.data.access
          setInMemoryToken(newAccessToken)
          store.dispatch({ type: 'auth/setAccessToken', payload: newAccessToken })
          processQueue(null, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          setInMemoryToken(null)
          store.dispatch({ type: 'auth/logout' })
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
      return Promise.reject(error)
    }
  )
}

export default axiosInstance