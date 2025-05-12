import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Chat } from "./components/prompt"

export interface ChatPageProps {
    params: {
        projectId: string
        promptId: string
    }
}

export default function ChatPage({ params: { projectId, promptId } }: ChatPageProps) {
    
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} promptId={promptId} />
            <Chat promptId={promptId} projectId={projectId} className="p-4" />
        </SidebarInset>
    )
}