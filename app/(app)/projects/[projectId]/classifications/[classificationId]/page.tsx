import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from './components/site-header'
import { Classification } from './components/classification'
import type { Metadata } from 'next'

export interface ClassificationPageProps {
    params: {
        projectId: string
        classificationId: string
    }
}

export const metadata: Metadata = {
  title: 'Classification Details',
}

export default function ClassificationPage({ params: { projectId, classificationId } }: ClassificationPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} classificationId={classificationId} />
            <Classification classificationId={classificationId} projectId={projectId} className="p-4 pb-0" />
        </SidebarInset >
    )
}