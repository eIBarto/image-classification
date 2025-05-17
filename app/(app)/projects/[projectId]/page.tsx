import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Files } from "./components/files"
import { getCurrentUserFromCookies } from "@/lib/amplify-utils"
import type { Metadata } from 'next'

export interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export const metadata: Metadata = {
  title: 'Project Details',
}

export default async function ProjectPage({ params: { projectId } }: ProjectPageProps) {
  const { userId } = await getCurrentUserFromCookies()

  return (
    <SidebarInset className="h-screen flex flex-col">
      <SiteHeader projectId={projectId} userId={userId} />
      <Files projectId={projectId} className="p-4 pb-0" />
    </SidebarInset>
  )
}