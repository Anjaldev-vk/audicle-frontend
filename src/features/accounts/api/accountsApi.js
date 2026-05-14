import { baseApi } from '../../../services/baseApi'

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/accounts/organisation/
    getOrganisation: builder.query({
      query: () => 'accounts/organisation/',
      providesTags: ['Organisation'],
    }),

    // PATCH /api/v1/accounts/organisation/
    updateOrganisation: builder.mutation({
      query: (data) => ({
        url: 'accounts/organisation/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Organisation'],
    }),

    // GET /api/v1/accounts/organisation/members/
    getMembers: builder.query({
      query: () => 'accounts/organisation/members/',
      providesTags: ['Membership'],
    }),

    // POST /api/v1/accounts/organisation/invites/
    inviteMember: builder.mutation({
      query: (data) => ({
        url: 'accounts/organisation/invites/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Membership'],
    }),

    // DELETE /api/v1/accounts/organisation/members/<uuid>/
    removeMember: builder.mutation({
      query: (userId) => ({
        url: `accounts/organisation/members/${userId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Membership'],
    }),

    // GET /api/v1/accounts/organisation/invites/<code>/verify/
    verifyInvite: builder.query({
      query: (code) => `accounts/organisation/invites/${code}/verify/`,
    }),

    // POST /api/v1/accounts/invites/<code>/accept/
    acceptInvite: builder.mutation({
      query: (code) => ({
        url: `accounts/invites/${code}/accept/`,
        method: 'POST',
      }),
      invalidatesTags: ['Organisation', 'Workspace'],
    }),

    // ── MFA ──────────────────────────────────────
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

    // ── Sessions ─────────────────────────────────
    getSessions: builder.query({
      query: () => 'accounts/sessions/',
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation({
      query: (id) => ({
        url: `accounts/sessions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // ── Password ─────────────────────────────────
    changePassword: builder.mutation({
      query: (data) => ({
        url: 'accounts/change-password/',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Calendar status ──────────────────────────
    getCalendarStatus: builder.query({
      query: () => 'calendar/status/',
      providesTags: ['Calendar'],
    }),
  }),
})

export const {
  useGetOrganisationQuery,
  useUpdateOrganisationMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useVerifyInviteQuery,
  useAcceptInviteMutation,
  useEnableMfaMutation,
  useVerifyMfaSetupMutation,
  useDisableMfaMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useChangePasswordMutation,
  useGetCalendarStatusQuery,
} = accountsApi
