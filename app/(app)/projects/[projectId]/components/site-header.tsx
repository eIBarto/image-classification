"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { NavActions } from "./nav-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import { Button } from "@/components/ui/button";
import type { Schema } from '@/amplify/data/resource';
import { Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProjectForm, ProjectFormSchema } from "./project-form";
import { toast } from "sonner";
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

async function updateProject(options: Schema["updateProjectProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateProjectProxy(options)

    if (errors) {
        console.error("Failed to update project")
        throw new Error("Failed to update project")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}



export function SiteHeader({ projectId, userId }: SiteHeaderProps) {
    const queryClient = useQueryClient()

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
    })

    const updateProjectMutation = useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] })
            // todo invalidate correctly
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update project")
        }
    })

    async function handleUpdateProject(values: ProjectFormSchema) {
        await updateProjectMutation.mutateAsync({
            id: projectId,
            name: values.name,
            description: values.description
        })
    }

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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit project</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Here you can edit your project details.
                            </DialogDescription>
                        </DialogHeader>
                        <ProjectForm defaultValues={{ name: project?.name, description: project?.description ?? undefined }} onSubmit={handleUpdateProject} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="ml-auto px-3">
                <NavActions projectId={projectId} userId={userId} />
            </div>
        </header>
    )
}   