import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"

/*import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import { fetchUserAttributesFromCookies, cookiesClient } from "@/lib/amplify-utils"
import type { Schema } from "@/amplify/data/resource";

async function fetchProjects(options: Schema["listProjectMembershipsByAccountProxy"]["args"] = {}) {
    const { data: projects, errors } = await cookiesClient.queries.listProjectMembershipsByAccountProxy(options);

    if (errors) {
        throw new Error("Failed to fetch projects")
    }

    if (!projects) {
        throw new Error("No projects returned")
    }

    return projects
}
*/
export async function PrefetchedAppSidebar(props: React.ComponentProps<typeof AppSidebar>) {
  /*const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  })

  await queryClient.prefetchQuery({
    queryKey: ['user-attributes'],
    queryFn: fetchUserAttributesFromCookies,
  })
*/
  return (
  //  <HydrationBoundary state={dehydrate(queryClient)}>
      <AppSidebar {...props} />
  //  </HydrationBoundary>
  )
}
