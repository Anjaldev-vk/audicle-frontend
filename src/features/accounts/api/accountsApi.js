import { baseApi } from '../../../services/baseApi'

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganisation: builder.query({
      query: () => 'accounts/organisation/',
      providesTags: ['Organisation'],
    }),
    updateOrganisation: builder.mutation({
      query: (data) => ({
        url: 'accounts/organisation/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Organisation'],
    }),
    getMembers: builder.query({
      query: () => 'accounts/organisation/members/',
      providesTags: ['Member'],
    }),
    inviteMember: builder.mutation({
      query: (data) => ({
        url: 'accounts/organisation/invite/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Member'],
    }),
    removeMember: builder.mutation({
      query: (userId) => ({
        url: `accounts/organisation/members/${userId}/remove/`,
        method: 'POST',
      }),
      invalidatesTags: ['Member'],
    }),
    enableMfa: builder.mutation({
      query: () => ({
        url: 'accounts/mfa/enable/',
        method: 'POST',
      }),
    }),
    verifyMfaSetup: builder.mutation({
      query: (data) => ({
        url: 'accounts/mfa/verify-setup/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    disableMfa: builder.mutation({
      query: () => ({
        url: 'accounts/mfa/disable/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetOrganisationQuery,
  useUpdateOrganisationMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useEnableMfaMutation,
  useVerifyMfaSetupMutation,
  useDisableMfaMutation,
} = accountsApi
