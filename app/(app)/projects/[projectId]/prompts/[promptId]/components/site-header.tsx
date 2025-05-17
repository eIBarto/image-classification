"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { NavActions } from "./nav-actions" // TODO CUSTOM NAV ACTIONS
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { PromptOptions } from "./prompt-options"

const client = generateClient<Schema>();

export interface SiteHeaderProps {
    projectId: string
    promptId: string
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

async function getPrompt(promptId: string) {
    const { data, errors } = await client.models.Prompt.get({ id: promptId })
    if (errors) {
        console.error(`Failed to get prompt: ${JSON.stringify(errors, null, 2)}`)
        throw new Error(`Failed to get prompt: ${JSON.stringify(errors, null, 2)}`)
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

// todo add loading state
export function SiteHeader({ projectId, promptId }: SiteHeaderProps) {
    const { data: prompt } = useQuery({
        queryKey: ["prompt", promptId],
        queryFn: () => getPrompt(promptId),
    })

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
    })

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/projects/${projectId}`}>
                                {project?.name || "Project"}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/projects/${projectId}/prompts`}>
                                Prompts
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="truncate max-w-[500px]">{prompt?.summary || "Prompt"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <PromptOptions projectId={projectId} promptId={promptId} />
            </div>
            <div className="ml-auto px-4">
                <NavActions projectId={projectId} promptId={promptId} />
            </div>
        </header>
    )
}