import { baseApi } from '../../../services/baseApi'

export const transcriptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTranscript: builder.query({
      query: (meetingId) => `meetings/${meetingId}/transcript/`,
      providesTags: (result, error, meetingId) => [{ type: 'Transcript', id: meetingId }],
    }),
    getTranscriptSegments: builder.query({
      query: (meetingId) => `meetings/${meetingId}/transcript/segments/`,
      providesTags: (result, error, meetingId) => [{ type: 'Segment', id: meetingId }],
    }),
    editSegment: builder.mutation({
      query: ({ meetingId, segmentId, text, speaker_name }) => ({
        url: `meetings/${meetingId}/transcript/segments/${segmentId}/`,
        method: 'PATCH',
        body: { text, speaker_name },
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Segment', id: meetingId }],
    }),
    getSummary: builder.query({
      query: (meetingId) => `meetings/${meetingId}/summary/`,
      providesTags: (result, error, meetingId) => [{ type: 'Summary', id: meetingId }],
    }),
    translateSummary: builder.mutation({
      query: ({ meetingId, language }) => ({
        url: `meetings/${meetingId}/summary/translate/`,
        method: 'POST',
        body: { language },
      }),
      invalidatesTags: (result, error, { meetingId }) => [{ type: 'Summary', id: meetingId }],
    }),
  }),
})

export const {
  useGetTranscriptQuery,
  useGetTranscriptSegmentsQuery,
  useEditSegmentMutation,
  useGetSummaryQuery,
  useTranslateSummaryMutation,
} = transcriptApi
