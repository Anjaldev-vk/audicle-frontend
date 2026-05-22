import { baseApi } from '../../../services/baseApi'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ limit = 20, lastKey = null } = {}) => ({
        url: 'notifications/',
        params: { 
          limit, 
          last_key: lastKey && lastKey !== 'null' && lastKey !== 'undefined'
            ? (typeof lastKey === 'object' ? JSON.stringify(lastKey) : lastKey)
            : undefined
        }
      }),
      // Always merge the results for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || !arg?.lastKey) return newItems
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
      query: ({ id }) => ({
        url: `notifications/${id}/read/`,
        method: 'PATCH',
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notif = draft.results.find((n) => n.id === id)
            if (notif) {
              notif.is_read = 'true'
              draft.unread_count = Math.max(0, (draft.unread_count || 1) - 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: 'notifications/read-all/',
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft.results.forEach((n) => {
              n.is_read = 'true'
            })
            draft.unread_count = 0
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: ({ id }) => ({
        url: `notifications/${id}/`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notifIndex = draft.results.findIndex((n) => n.id === id)
            if (notifIndex !== -1) {
              const notif = draft.results[notifIndex]
              if (notif.is_read !== 'true' && notif.is_read !== true) {
                 draft.unread_count = Math.max(0, (draft.unread_count || 1) - 1)
              }
              draft.results.splice(notifIndex, 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
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
