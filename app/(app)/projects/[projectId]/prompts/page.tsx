import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Prompts } from "./components/prompts"
import type { Metadata } from 'next'

export interface PromptsPageProps {
    params: {
        projectId: string
    }
}

export const metadata: Metadata = {
  title: 'Prompts | Image Classification',
}

export default function PromptsPage({ params: { projectId } }: PromptsPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} />
            <Prompts projectId={projectId} className="p-4 pb-0" />
        </SidebarInset>
    )
}