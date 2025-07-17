"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { NavActions } from "./nav-actions" // TODO CUSTOM NAV ACTIONS
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { PromptOptions } from "./prompt-options"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
            <div className="flex gap-2 ml-auto px-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <HelpCircle className="h-5 w-5" />
                            <span className="sr-only">Hilfe</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-1.5 pt-0 overflow-hidden border-0 max-w-screen-lg">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Video-Anleitung</DialogTitle>
                            <DialogDescription>
                                This is a video tutorial for project actions.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="prompt-versions" className="relative">
                            <TabsList className="absolute z-10 grid w-auto grid-cols-3 bottom-2 right-2">
                                <TabsTrigger value="prompt-versions">Versionen</TabsTrigger>
                                <TabsTrigger value="prompt-labels">Labels</TabsTrigger>
                                <TabsTrigger value="prompt-actions">Details</TabsTrigger>
                            </TabsList>
                            <TabsContent value="prompt-versions">
                                <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                    <source
                                        src="/videos/prompt-versions.mp4"
                                        type="video/mp4"
                                    />
                                    Dein Browser unterstützt das Video-Tag nicht.
                                </video>
                            </TabsContent>
                            <TabsContent value="prompt-labels">
                                <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                    <source
                                        src="/videos/prompt-labels.mp4"
                                        type="video/mp4"
                                    />
                                    Dein Browser unterstützt das Video-Tag nicht.
                                </video>
                            </TabsContent>
                            <TabsContent value="prompt-actions">
                                <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                    <source
                                        src="/videos/prompt-actions.mp4"
                                        type="video/mp4"
                                    />
                                    Dein Browser unterstützt das Video-Tag nicht.
                                </video>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
                <NavActions projectId={projectId} promptId={promptId} />
            </div>
        </header>
    )
}