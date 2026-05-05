import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from './axiosBaseQuery'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'User',
    'Organisation',
    'Membership',
    'Workspace',
    'Meeting',
    'Participant',
    'Transcript',
    'Summary',
    'Segment',
    'ChatSession',
    'ChatMessage',
    'Notification',
    'ActionItem',
    'Template'
  ],
  endpoints: () => ({}),
})
