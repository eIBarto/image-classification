import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import { AuthFetchUserAttributesServer, cookiesClient } from "@/lib/amplify-utils"

async function fetchProjects() {
    const { data: projects, errors } = await cookiesClient.models.Project.list();

    if (errors) {
        throw new Error("Failed to fetch projects")
    }

    return projects
}

export async function PrefetchedAppSidebar(props: React.ComponentProps<typeof AppSidebar>) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  await queryClient.prefetchQuery({
    queryKey: ['user-attributes'],
    queryFn: AuthFetchUserAttributesServer,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppSidebar {...props} />
    </HydrationBoundary>
  )
}
