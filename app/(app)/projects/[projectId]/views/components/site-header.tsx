"use client"
/**
 * Header for the Views page
 * - Breadcrumbs, help video, and create view actions
 */

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { NavActions } from "./nav-actions"
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

const client = generateClient<Schema>();

export interface SiteHeaderProps {
    projectId: string
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

export function SiteHeader({ projectId }: SiteHeaderProps) {
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
                            <BreadcrumbPage>Views</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="ml-auto flex gap-2 px-4">
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
                            <DialogDescription>This is a video tutorial for creating views.</DialogDescription>
                        </DialogHeader>
                        <video autoPlay muted loop preload="auto" className="rounded-sm">
                            <source src="/videos/create-view.mp4" type="video/mp4" />
                            Dein Browser unterstützt das Video-Tag nicht.
                        </video>
                    </DialogContent>
                </Dialog>
                <NavActions projectId={projectId} />
            </div>
        </header>
    )
}