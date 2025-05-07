import { SiteHeader } from "./components/site-header"
import { Members } from "./components/members"

export interface MembersPageProps {
    params: {
        projectId: string
    }
}

export default function MembersPage({ params: { projectId } }: MembersPageProps) {

    return (
        <div className="flex flex-col h-screen">
            <SiteHeader projectId={projectId} />
            <Members projectId={projectId} />
        </div>
    )
}