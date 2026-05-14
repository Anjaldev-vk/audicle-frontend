import { baseApi } from '../../../services/baseApi'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ limit = 20, lastKey = null } = {}) => ({
        url: 'notifications/',
        params: { limit, last_key: lastKey }
      }),
      // Always merge the results for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
      },
      merge: (currentCache, newItems) => {
        if (!currentCache) return newItems
        // If we have a lastKey, it's a pagination request, so append
        // If no lastKey, it's a refresh, so replace
        return {
          ...newItems,
          data: {
            ...newItems.data,
            results: [...currentCache.data.results, ...newItems.data.results],
            last_key: newItems.data.last_key,
            unread_count: newItems.data.unread_count
          }
        }
      },
      // Force refetch when the query args change (e.g. new lastKey)
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.lastKey !== previousArg?.lastKey
      },
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: ({ id, sk }) => ({
        url: `notifications/${id}/read/`,
        method: 'PATCH',
        body: { sk },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: 'notifications/read-all/',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: ({ id, sk }) => ({
        url: `notifications/${id}/`,
        method: 'DELETE',
        body: { sk },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi
