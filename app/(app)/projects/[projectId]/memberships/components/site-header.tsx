import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cookiesClient } from "@/lib/amplify-utils";
import { CreateMemberSheet } from "./create-member-sheet";

export type SiteHeaderProps = {
    projectId: string
}

export async function SiteHeader({ projectId }: SiteHeaderProps) {
    const { data: project, errors } = await cookiesClient.models.Project.get({ id: projectId })

    if (errors) {
        throw new Error("Failed to get project")
    }

    if (!project) {
        throw new Error("Project not found")
    }

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/projects`}>Projects</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/projects/${projectId}`}>{project.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {/*<BreadcrumbItem>
                            <BreadcrumbLink href={`/projects/${projectId}/upload`}>Upload</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />*/}
                        <BreadcrumbItem>
                            <BreadcrumbPage>Members</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
                <CreateMemberSheet projectId={projectId} />
            </div>
        </header>
    )
}