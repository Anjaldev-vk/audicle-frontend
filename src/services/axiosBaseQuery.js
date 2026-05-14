import axiosInstance from './axiosInstance'

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async (args, api) => {
    // If args is a string, treat it as the URL for a GET request
    const config = typeof args === 'string' ? { url: args, method: 'GET' } : args
    
    let { url, method, data, body, params, headers } = config
    
    // Inject active workspace ID into params to ensure RTK Query cache keys are unique per workspace
    // This prevents "data leaking" when switching workspaces due to stale cache
    const workspaceId = api.getState().workspace.activeWorkspaceId
    const requestParams = { ...params }
    if (workspaceId) {
      requestParams._ws = workspaceId
    }

    // Map RTK Query 'body' to Axios 'data'
    const requestData = data || body

    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method: method || 'GET',
        data: requestData,
        params: requestParams,
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
