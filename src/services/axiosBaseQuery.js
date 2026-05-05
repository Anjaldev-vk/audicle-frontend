import axiosInstance from './axiosInstance'

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async (args) => {
    // If args is a string, treat it as the URL for a GET request
    const config = typeof args === 'string' ? { url: args, method: 'GET' } : args
    
    let { url, method, data, body, params, headers } = config
    
    // Map RTK Query 'body' to Axios 'data'
    const requestData = data || body

    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method: method || 'GET',
        data: requestData,
        params,
        headers,
      })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

export default axiosBaseQuery
