"use client"
/**
 * Prompt options menu
 * - Edit/delete prompt; invalidates relevant caches and redirects if deleted
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
import { PromptForm, PromptFormSchema } from "./prompt-form"
import { useRouter } from "next/navigation"

const client = generateClient<Schema>()

export interface PromptOptionsProps {
    shouldCloseDialogs?: boolean
    projectId: string
    promptId: string
}

async function deletePrompt(options: Schema["deletePromptProxy"]["args"]) {
    const { data, errors } = await client.mutations.deletePromptProxy(options)
    if (errors) {
        throw new Error("Failed to delete prompt")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function updatePrompt(options: Schema["updatePromptProxy"]["args"]) {
    const { data, errors } = await client.mutations.updatePromptProxy(options)

    if (errors) {
        console.error("Failed to update prompt")
        throw new Error("Failed to update prompt")
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
        console.error("Failed to get prompt")
        throw new Error("Failed to get prompt")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export function PromptOptions({ shouldCloseDialogs = true, promptId, projectId }: PromptOptionsProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { data: prompt } = useQuery({
        queryKey: ["prompt", promptId],
        queryFn: () => getPrompt(promptId)
    })

    const deletePromptMutation = useMutation({
        mutationFn: deletePrompt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prompts", projectId] })
            queryClient.invalidateQueries({ queryKey: ["prompt", promptId] })
            router.replace(`/projects/${projectId}/prompts`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete prompt")
        }
    })

    const updatePromptMutation = useMutation({
        mutationFn: updatePrompt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prompt", promptId] })
            queryClient.invalidateQueries({ queryKey: ["prompts", projectId] })
            if (shouldCloseDialogs) {
                closeDialogs()
            }

        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update prompt")
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

    const isSubmitting = deletePromptMutation.isPending || updatePromptMutation.isPending

    async function handleDeletePrompt() {
        await deletePromptMutation.mutateAsync({ projectId, id: promptId })
    }

    async function handleUpdatePrompt(values: PromptFormSchema) {
        await updatePromptMutation.mutateAsync({ projectId, id: promptId, summary: values.summary, description: values.description })
    }

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Prompt options</span>
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
                        <DialogTitle>Delete prompt</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this prompt? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeletePrompt} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit prompt</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the prompt.
                        </DialogDescription>
                    </DialogHeader>
                    <PromptForm defaultValues={{ summary: prompt?.summary ?? undefined, description: prompt?.description ?? undefined }} onSubmit={handleUpdatePrompt} />
                </DialogContent>
            </Dialog>
        </>
    )
}