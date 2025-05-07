import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "./components/site-header"
import { Files } from "./components/files"
import { getCurrentUserFromCookies } from "@/lib/amplify-utils"

export interface UploadsPageProps {
    params: {
        projectId: string
    }
}

export default async function UploadsPage({ params: { projectId } }: UploadsPageProps) {
    const { userId } = await getCurrentUserFromCookies()

    return (
        <SidebarInset className="h-screen flex flex-col">
            <SiteHeader projectId={projectId} userId={userId} />
            <Files projectId={projectId} className="p-4" />
        </SidebarInset>
    )
}