import { baseApi } from '../../../services/baseApi'

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarStatus: builder.query({
      query: () => 'calendar/status/',
      providesTags: ['User'],
    }),
    connectCalendar: builder.mutation({
      query: () => ({
        url: 'calendar/connect/',
        method: 'GET',
      }),
    }),
    disconnectCalendar: builder.mutation({
      query: () => ({
        url: 'calendar/disconnect/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    syncCalendar: builder.mutation({
      query: () => ({
        url: 'calendar/sync/',
        method: 'POST',
      }),
      invalidatesTags: ['Meeting'],
    }),
    calendarCallback: builder.mutation({
      query: (params) => ({
        url: 'calendar/callback/',
        method: 'GET',
        params,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetCalendarStatusQuery,
  useConnectCalendarMutation,
  useDisconnectCalendarMutation,
  useSyncCalendarMutation,
  useCalendarCallbackMutation,
} = calendarApi
