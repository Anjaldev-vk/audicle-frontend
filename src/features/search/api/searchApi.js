import { baseApi } from '../../../services/baseApi'

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: (params) => ({
        url: 'search/',
        params,
      }),
    }),
  }),
})

export const { useSearchQuery } = searchApi
