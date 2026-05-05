import { baseApi } from '../../../services/baseApi'

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (data) => ({
        url: 'accounts/me/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: 'accounts/change-password/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi
