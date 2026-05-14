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
    googleLogin: builder.mutation({
      query: (data) => ({
        url: 'accounts/login/google/',
        method: 'POST',
        body: data,
      }),
    }),
    verifyMfa: builder.mutation({
      query: (data) => ({
        url: 'accounts/mfa/verify/',
        method: 'POST',
        body: data,
      }),
    }),
    requestMfaRecovery: builder.mutation({
      query: (data) => ({
        url: 'accounts/mfa/recover/request/',
        method: 'POST',
        body: data,
      }),
    }),
    verifyMfaRecovery: builder.mutation({
      query: (data) => ({
        url: 'accounts/mfa/recover/verify/',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: 'accounts/token/refresh/',
        method: 'POST',
      }),
    }),
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: 'accounts/password-reset/request/',
        method: 'POST',
        body: data,
      }),
    }),
    confirmPasswordReset: builder.mutation({
      query: (data) => ({
        url: 'accounts/password-reset/confirm/',
        method: 'POST',
        body: data,
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
  useGoogleLoginMutation,
  useVerifyMfaMutation,
  useRequestMfaRecoveryMutation,
  useVerifyMfaRecoveryMutation,
  useRefreshTokenMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useGetMeQuery 
} = authApi


