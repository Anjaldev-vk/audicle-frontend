import { setInMemoryToken, getInMemoryToken } from './axiosInstance'

const tokenService = {
  setToken: (token) => setInMemoryToken(token),
  getToken: () => getInMemoryToken(),
  clearToken: () => setInMemoryToken(null),
}

export default tokenService
