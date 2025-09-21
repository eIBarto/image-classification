'use client'
/** React Query client setup with SSR-safe singleton on the client */

import {
  isServer,
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid over-fetching; adjust per page if needed
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // New instance per request on server
    return makeQueryClient()
  } else {
    // Reuse single instance on client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  // Keep client stable across renders
  const queryClient = getQueryClient()

  return (
    <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>
  )
}