import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from './components/site-header'
import { View } from './components/view'
import type { Metadata } from 'next'

export interface ViewPageProps {
    params: {
        projectId: string
        viewId: string
    }
}

export const metadata: Metadata = {
  title: 'View Details',
}

export default function ViewPage({ params: { projectId, viewId } }: ViewPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} viewId={viewId} />
            <View projectId={projectId} viewId={viewId} className="p-4 pb-0" />
        </SidebarInset >
    )
}