import { baseApi } from '../../../services/baseApi'

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query({
      query: (params) => ({
        url: 'analytics/overview/',
        params,
      }),
    }),
    getMeetingsChart: builder.query({
      query: (params) => ({
        url: 'analytics/meetings/',
        params,
      }),
    }),
    getActivityChart: builder.query({
      query: (params) => ({
        url: 'analytics/activity/',
        params,
      }),
    }),
    getTeamOverview: builder.query({
      query: (params) => ({
        url: 'analytics/team/overview/',
        params,
      }),
    }),
    getTeamMembers: builder.query({
      query: (params) => ({
        url: 'analytics/team/members/',
        params,
      }),
    }),
  }),
})

export const {
  useGetAnalyticsOverviewQuery,
  useGetMeetingsChartQuery,
  useGetActivityChartQuery,
  useGetTeamOverviewQuery,
  useGetTeamMembersQuery,
} = analyticsApi
