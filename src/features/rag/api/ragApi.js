import { baseApi } from '../../../services/baseApi'

export const ragApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatSessions: builder.query({
      query: () => 'rag/chat/sessions/',
      providesTags: ['ChatSession'],
    }),
    getChatSession: builder.query({
      query: (id) => `rag/chat/sessions/${id}/`,
      providesTags: (result, error, id) => [{ type: 'ChatSession', id }],
    }),
    createChatSession: builder.mutation({
      query: (data) => ({
        url: 'rag/chat/sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ChatSession'],
    }),
    sendMessage: builder.mutation({
      query: ({ sessionId, content, meetingId }) => ({
        url: `rag/chat/sessions/${sessionId}/messages/`,
        method: 'POST',
        body: { content, meeting_id: meetingId },
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'ChatSession', id: sessionId }],
    }),
    deleteChatSession: builder.mutation({
      query: (id) => ({
        url: `rag/chat/sessions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ChatSession'],
    }),
    ragSearch: builder.query({
      query: (q) => `rag/search/?q=${encodeURIComponent(q)}`,
    }),
  }),
})

export const {
  useGetChatSessionsQuery,
  useGetChatSessionQuery,
  useCreateChatSessionMutation,
  useSendMessageMutation,
  useDeleteChatSessionMutation,
  useRagSearchQuery,
} = ragApi
