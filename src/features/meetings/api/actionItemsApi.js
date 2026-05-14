import { baseApi } from '../../../services/baseApi'

export const actionItemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActionItems: builder.query({
      query: (params) => ({
        url: 'action-items/',
        params,
      }),
      providesTags: (result) => {
        const items = result?.data?.results || result?.data || (Array.isArray(result) ? result : []);
        return items.length > 0
          ? [
              ...items.map(({ id }) => ({ type: 'ActionItem', id })),
              { type: 'ActionItem', id: 'LIST' },
            ]
          : [{ type: 'ActionItem', id: 'LIST' }];
      },
    }),
    getMeetingActionItems: builder.query({
      query: (meetingId) => `meetings/${meetingId}/action-items/`,
      providesTags: (result) => {
        const items = result?.data?.results || result?.data || (Array.isArray(result) ? result : []);
        return items.length > 0
          ? [
              ...items.map(({ id }) => ({ type: 'ActionItem', id })),
              { type: 'ActionItem', id: 'MEETING_LIST' },
            ]
          : [{ type: 'ActionItem', id: 'MEETING_LIST' }];
      },
    }),
    updateActionItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `action-items/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ActionItem', id },
        { type: 'ActionItem', id: 'LIST' },
        { type: 'ActionItem', id: 'MEETING_LIST' },
      ],
    }),
    deleteActionItem: builder.mutation({
      query: (id) => ({
        url: `action-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ActionItem', id },
        { type: 'ActionItem', id: 'LIST' },
        { type: 'ActionItem', id: 'MEETING_LIST' },
      ],
    }),
  }),
})

export const {
  useGetActionItemsQuery,
  useGetMeetingActionItemsQuery,
  useUpdateActionItemMutation,
  useDeleteActionItemMutation,
} = actionItemsApi
