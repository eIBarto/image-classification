import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Prompts } from "./components/prompts"
import type { Metadata } from 'next'

export interface ChatsPageProps {
    params: {
        projectId: string
    }
}

export const metadata: Metadata = {
  title: 'Prompts',
}

export default function ChatsPage({ params: { projectId } }: ChatsPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} />
            <Prompts projectId={projectId} className="pt-4" />
        </SidebarInset>
    )
}