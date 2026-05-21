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
    getMeetingTranscript: builder.query({
      query: (id) => `meetings/${id}/transcript/`,
      providesTags: (result, error, id) => [{ type: 'Transcript', id }],
    }),
    getMeetingSummary: builder.query({
      query: (id) => `meetings/${id}/summary/`,
      providesTags: (result, error, id) => [{ type: 'Summary', id }],
    }),
    createMeeting: builder.mutation({
      query: (data) => ({
        url: 'meetings/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meeting'],
    }),
    deleteMeeting: builder.mutation({
      query: (id) => ({
        url: `meetings/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Meeting'],
    }),
    dispatchBot: builder.mutation({
      query: (meetingId) => ({
        url: `meetings/${meetingId}/bot/dispatch/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Meeting', id }, 'Notification'],
    }),
    stopBot: builder.mutation({
      query: (meetingId) => ({
        url: `meetings/${meetingId}/bot/stop/`,
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
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Meeting', id: meetingId }, 'Notification'],
    }),
    getTemplates: builder.query({
      query: () => 'meetings/templates/',
      providesTags: ['Template'],
    }),
    createTemplate: builder.mutation({
      query: (data) => ({
        url: 'meetings/templates/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),
    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `meetings/templates/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
    getParticipants: builder.query({
      query: (id) => `meetings/${id}/participants/`,
      providesTags: (result, error, id) => [{ type: 'Participant', id }],
    }),
    addParticipant: builder.mutation({
      query: ({ meetingId, data }) => ({
        url: `meetings/${meetingId}/participants/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Participant', id: meetingId }],
    }),
    removeParticipant: builder.mutation({
      query: ({ meetingId, participantId }) => ({
        url: `meetings/${meetingId}/participants/${participantId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Participant', id: meetingId }],
    }),
    getDownloadUrl: builder.query({
      query: (id) => `meetings/${id}/upload/download-url/`,
    }),
    getTranscriptSegments: builder.query({
      query: (id) => `meetings/${id}/transcript/segments/`,
      providesTags: (result, error, id) => [{ type: 'Transcript', id }],
    }),
    updateTranscriptSegment: builder.mutation({
      query: ({ meetingId, segmentId, data }) => ({
        url: `meetings/${meetingId}/transcript/segments/${segmentId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Transcript', id: meetingId }],
    }),
    retryTranscription: builder.mutation({
      query: (id) => ({
        url: `meetings/${id}/transcript/retry/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Transcript', id }],
    }),
    retrySummary: builder.mutation({
      query: (id) => ({
        url: `meetings/${id}/summary/retry/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Summary', id }],
    }),
    translateSummary: builder.mutation({
      query: ({ id, language }) => ({
        url: `meetings/${id}/summary/translate/`,
        method: 'POST',
        body: { language },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Summary', id }],
    }),
  }),
})

export const {
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useGetMeetingTranscriptQuery,
  useGetMeetingSummaryQuery,
  useCreateMeetingMutation,
  useDeleteMeetingMutation,
  useDispatchBotMutation,
  useStopBotMutation,
  useRequestUploadUrlMutation,
  useConfirmUploadMutation,
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetParticipantsQuery,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useGetDownloadUrlQuery,
  useGetTranscriptSegmentsQuery,
  useUpdateTranscriptSegmentMutation,
  useRetryTranscriptionMutation,
  useRetrySummaryMutation,
  useTranslateSummaryMutation,
} = meetingApi
