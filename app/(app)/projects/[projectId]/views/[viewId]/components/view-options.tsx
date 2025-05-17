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
import { ViewForm, ViewFormSchema } from "./view-form"
import { useRouter } from "next/navigation"
const client = generateClient<Schema>()

export interface ViewOptionsProps {
    shouldCloseDialogs?: boolean
    projectId: string
    viewId: string
}

async function deleteView(options: Schema["deleteViewProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteViewProxy(options)
    if (errors) {
        throw new Error("Failed to delete view")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function updateView(options: Schema["updateViewProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateViewProxy(options)

    if (errors) {
        console.error("Failed to update view")
        throw new Error("Failed to update view")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}


async function getView(viewId: string) {
    const { data, errors } = await client.models.View.get({ id: viewId })
    if (errors) {
        console.error("Failed to get view")
        throw new Error("Failed to get view")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}


export function ViewOptions({ shouldCloseDialogs = true, viewId, projectId }: ViewOptionsProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { data: view } = useQuery({
        queryKey: ["view", viewId],
        queryFn: () => getView(viewId)
    })

    const deleteViewMutation = useMutation({
        mutationFn: deleteView,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["views", projectId] })
            queryClient.invalidateQueries({ queryKey: ["view", viewId] })
            router.replace(`/projects/${projectId}/views`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete view")
        }
    })

    const updateViewMutation = useMutation({
        mutationFn: updateView,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["views", projectId] })
            queryClient.invalidateQueries({ queryKey: ["view", viewId] })
            if (shouldCloseDialogs) {
                closeDialogs()
            }
            // todo invalidate correctly
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update view")
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

    const isSubmitting = deleteViewMutation.isPending || updateViewMutation.isPending

    async function handleDeleteView() {
        await deleteViewMutation.mutateAsync({ projectId, viewId })
    }

    async function handleUpdateView(values: ViewFormSchema) {
        await updateViewMutation.mutateAsync({ projectId, viewId, name: values.name, description: values.description })
    }

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">View options</span>
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
                        <DialogTitle>Delete view</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this view? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteView} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit view</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the view.
                        </DialogDescription>
                    </DialogHeader>
                    <ViewForm defaultValues={{ name: view?.name, description: view?.description ?? undefined }} onSubmit={handleUpdateView} />
                </DialogContent>
            </Dialog>
        </>
    )
} 