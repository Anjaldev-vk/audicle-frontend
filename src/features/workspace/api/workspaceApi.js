import { baseApi } from '../../../services/baseApi'

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/accounts/workspaces/
    getWorkspaces: builder.query({
      query: () => 'accounts/workspaces/',
      providesTags: ['Workspace'],
    }),

    // POST /api/v1/accounts/workspaces/create/
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

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
} = workspaceApi
