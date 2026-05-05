import { baseApi } from '../../../services/baseApi'

export const meetingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetings: builder.query({
      query: () => 'meetings/',
      providesTags: ['Meeting'],
    }),
    getMeeting: builder.query({
      query: (id) => `meetings/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Meeting', id }],
    }),
    createMeeting: builder.mutation({
      query: (data) => ({
        url: 'meetings/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meeting'],
    }),
    dispatchBot: builder.mutation({
      query: (meetingId) => ({
        url: `meetings/${meetingId}/bot/dispatch/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Meeting', id }],
    }),
    requestUploadUrl: builder.mutation({
      query: ({ meetingId, fileName, contentType }) => ({
        url: `meetings/${meetingId}/upload/request-url/`,
        method: 'POST',
        body: { file_name: fileName, content_type: contentType },
      }),
    }),
    confirmUpload: builder.mutation({
      query: ({ meetingId, s3Key }) => ({
        url: `meetings/${meetingId}/upload/confirm/`,
        method: 'POST',
        body: { s3_key: s3Key },
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Meeting', id: meetingId }],
    }),
  }),
})

export const {
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useCreateMeetingMutation,
  useDispatchBotMutation,
  useRequestUploadUrlMutation,
  useConfirmUploadMutation,
} = meetingApi
