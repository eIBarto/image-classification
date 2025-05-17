"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { NavActions } from "./nav-actions";
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { ProjectOptions } from "./project-options";


const client = generateClient<Schema>();

export interface SiteHeaderProps {
    projectId: string
    userId: string
}

async function getProject(projectId: string) {
    const { data, errors } = await client.models.Project.get({ id: projectId })
    if (errors) {
        console.error("Failed to get project")
        throw new Error("Failed to get project")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}


export function SiteHeader({ projectId, userId }: SiteHeaderProps) {

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
    })

    
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{project?.name || "Project"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ProjectOptions projectId={projectId} />
            </div>
            <div className="ml-auto px-3">
                <NavActions projectId={projectId} userId={userId} />
            </div>
        </header>
    )
}   