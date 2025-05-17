import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Chat } from "./components/prompt"
import type { Metadata } from 'next'

export interface ChatPageProps {
    params: {
        projectId: string
        promptId: string
    }
}

export const metadata: Metadata = {
  title: 'Prompt Details',
}

export default function ChatPage({ params: { projectId, promptId } }: ChatPageProps) {
    
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} promptId={promptId} />
            <Chat promptId={promptId} projectId={projectId} className="p-4 pb-0" />
        </SidebarInset>
    )
}