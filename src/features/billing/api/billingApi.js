import { baseApi } from '../../../services/baseApi'

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingPlan: builder.query({
      query: () => 'billing/plan/',
      providesTags: ['Billing'],
    }),
    getBillingUsage: builder.query({
      query: () => 'billing/usage/',
      providesTags: ['Usage'],
    }),
    createCheckout: builder.mutation({
      query: (data) => ({
        url: 'billing/checkout/',
        method: 'POST',
        body: data,
      }),
    }),
    verifySubscription: builder.mutation({
      query: (data) => ({
        url: 'billing/verify/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Billing', 'Usage'],
    }),
    cancelSubscription: builder.mutation({
      query: () => ({
        url: 'billing/cancel/',
        method: 'POST',
      }),
      invalidatesTags: ['Billing'],
    }),
  }),
})

export const {
  useGetBillingPlanQuery,
  useGetBillingUsageQuery,
  useCreateCheckoutMutation,
  useVerifySubscriptionMutation,
  useCancelSubscriptionMutation,
} = billingApi
