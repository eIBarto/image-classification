import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Prompts } from "./components/prompts"

export interface ChatsPageProps {
    params: {
        projectId: string
    }
}

export default function ChatsPage({ params: { projectId } }: ChatsPageProps) {
    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} />
            <Prompts projectId={projectId} className="pt-4" />
        </SidebarInset>
    )
}