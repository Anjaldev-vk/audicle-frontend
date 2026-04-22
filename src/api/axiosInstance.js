import axios from 'axios'

// in-memory access token
// never stored in localStorage — XSS protection
let inMemoryAccessToken = null

export const setInMemoryToken = (token) => {
  inMemoryAccessToken = token
}

export const getInMemoryToken = () => inMemoryAccessToken

const API_URL = import.meta.env.VITE_API_URL
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}/`,
  withCredentials: true, // sends HttpOnly refresh cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance