"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from "next/navigation"
import { ProjectForm, ProjectFormSchema } from "@/app/(app)/components/project-form"

const client = generateClient<Schema>()

export interface ProjectOptionsProps {
    shouldCloseDialogs?: boolean
    projectId: string
}

async function deleteProject(options: Schema["deleteProjectProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteProjectProxy(options)
    if (errors) {
        throw new Error("Failed to delete project")
    }

    if (!data) {
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


export function ProjectOptions({ shouldCloseDialogs = true, projectId }: ProjectOptionsProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId)
    })

    const deleteProjectMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.invalidateQueries({ queryKey: ["project", projectId] })
            router.replace("/projects")
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete project")
        }
    })

    const updateProjectMutation = useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] })
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            if (shouldCloseDialogs) {
                closeDialogs()
            }
            // todo invalidate correctly
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update project")
        }
    })

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function openEditDialog() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)
        setIsEditOpen(false)
    }

    useEffect(() => {
        if (isMenuOpen) {
            closeDialogs(true)
        }
    }, [isMenuOpen])

    const isSubmitting = deleteProjectMutation.isPending || updateProjectMutation.isPending

    async function handleDeleteProject() {
        await deleteProjectMutation.mutateAsync({ id: projectId })
    }

    async function handleUpdateProject(values: ProjectFormSchema) {
        await updateProjectMutation.mutateAsync({ id: projectId, name: values.name, description: values.description })
    }

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Project options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={openDeleteDialog}>
                        Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openEditDialog}>
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteProject} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit project</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the project.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm defaultValues={{ name: project?.name, description: project?.description ?? undefined }} onSubmit={handleUpdateProject} />
                </DialogContent>
            </Dialog>
        </>
    )
} 