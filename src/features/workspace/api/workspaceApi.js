import { baseApi } from '../../../services/baseApi'

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query({
      query: () => 'accounts/workspaces/',
      providesTags: ['Workspace'],
    }),
    createWorkspace: builder.mutation({
      query: (data) => ({
        url: 'accounts/workspaces/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workspace'],
    }),
  }),
})

export const { useGetWorkspacesQuery, useCreateWorkspaceMutation } = workspaceApi


