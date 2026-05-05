import { baseApi } from '../../../services/baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'accounts/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'accounts/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'accounts/logout/',
        method: 'POST',
      }),
    }),
    getMe: builder.query({
      query: () => 'accounts/me/',
      providesTags: ['User'],
    }),
  }),
})

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useGetMeQuery 
} = authApi


