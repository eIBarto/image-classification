import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Projects } from "./components/projects"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  return (
    <SidebarInset className="h-screen flex flex-col">
      <SiteHeader />
      <Projects className="pt-4" />
    </SidebarInset>
  )
}