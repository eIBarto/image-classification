"use client"
/**
 * Classification options dropdown: edit/delete dialogs
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { ClassificationForm, ClassificationFormSchema } from "./classification-form"
import { useRouter } from "next/navigation"
const client = generateClient<Schema>()

export interface ClassificationOptionsProps {
    shouldCloseDialogs?: boolean
    projectId: string
    classificationId: string
}

async function deleteClassification(options: Schema["deleteClassificationProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteClassificationProxy(options)
    if (errors) {
        throw new Error("Failed to delete classification")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function updateClassification(options: Schema["updateClassificationProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateClassificationProxy(options)

    if (errors) {
        console.error("Failed to update classification")
        throw new Error("Failed to update classification")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function getClassification(classificationId: string) {
    const { data, errors } = await client.models.Classification.get({ id: classificationId })
    if (errors) {
        console.error("Failed to get classification")
        throw new Error("Failed to get classification")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export function ClassificationOptions({ shouldCloseDialogs = true, classificationId, projectId }: ClassificationOptionsProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { data: classification } = useQuery({
        queryKey: ["classification", classificationId],
        queryFn: () => getClassification(classificationId)
    })

    const deleteClassificationMutation = useMutation({
        mutationFn: deleteClassification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classification", classificationId] })
            queryClient.invalidateQueries({ queryKey: ["classifications", projectId] })
            router.replace(`/projects/${projectId}/classifications`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete classification")
        }
    })

    const updateClassificationMutation = useMutation({
        mutationFn: updateClassification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classification", classificationId] })
            queryClient.invalidateQueries({ queryKey: ["classifications", projectId] })
            if (shouldCloseDialogs) {
                closeDialogs()
            }

        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update classification")
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
        console.log("closeDialogs", ignoreMenu)
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

    const isSubmitting = deleteClassificationMutation.isPending || updateClassificationMutation.isPending

    async function handleDeleteClassification() {
        await deleteClassificationMutation.mutateAsync({ projectId, id: classificationId })
    }

    async function handleUpdateClassification(values: ClassificationFormSchema) {
        await updateClassificationMutation.mutateAsync({ projectId, id: classificationId, name: values.name, description: values.description })
    }

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Classification options</span>
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
                        <DialogTitle>Delete classification</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this classification? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteClassification} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit classification</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the classification.
                        </DialogDescription>
                    </DialogHeader>
                    <ClassificationForm defaultValues={{ name: classification?.name, description: classification?.description ?? undefined }} onSubmit={handleUpdateClassification} />
                </DialogContent>
            </Dialog>
        </>
    )
}