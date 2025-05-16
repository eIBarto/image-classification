import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Views } from "./components/views"
import type { Metadata } from 'next'

export interface ViewsPageProps {
    params: {
        projectId: string
    }
}

export const metadata: Metadata = {
  title: 'Views',
}

export default function ViewsPage({ params: { projectId } }: ViewsPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} />
            <Views projectId={projectId} className="p-4" />
        </SidebarInset>
    )
}