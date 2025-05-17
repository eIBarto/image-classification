import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Classifications } from "./components/classifications"
import type { Metadata } from 'next'

export interface ClassificationsPageProps {
    params: {
        projectId: string
    }
}

export const metadata: Metadata = {
  title: 'Classifications',
}

export default function ClassificationsPage({ params: { projectId } }: ClassificationsPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} />
            <Classifications projectId={projectId} className="p-4" />
        </SidebarInset>
    )
}