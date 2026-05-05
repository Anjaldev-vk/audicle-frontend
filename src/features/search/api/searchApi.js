import { baseApi } from '../../../services/baseApi'

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: ({ q, type = 'all' }) => ({
        url: 'search/',
        params: { q, type },
      }),
    }),
  }),
})

export const { useSearchQuery } = searchApi
