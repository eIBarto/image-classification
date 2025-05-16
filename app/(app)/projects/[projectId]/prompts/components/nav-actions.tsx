"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"
import { useState } from "react"
import { PromptForm, PromptFormSchema } from "./prompt-form"
import { useRouter } from "next/navigation"

const client = generateClient<Schema>();

export interface NavActionsProps {
    projectId: string
}

async function createPrompt(options: Schema["createPromptProxy"]["args"]) {
    const { data, errors } = await client.mutations.createPromptProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create prompt")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export function NavActions({ projectId }: NavActionsProps) {
    const queryClient = useQueryClient()
    const router = useRouter()

    const [isOpen, setIsOpen] = useState(false)

    const createPromptMutation = useMutation({
        mutationFn: createPrompt,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["project-prompts", projectId] })
            setIsOpen(false)
            router.push(`/projects/${projectId}/prompts/${data.id}`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create prompt")
        }
    })

    async function handleCreatePrompt(values: PromptFormSchema) {
        const { labels, ...rest } = values
        await createPromptMutation.mutateAsync({ projectId: projectId, ...rest, labels: labels.map((label) => label.id) })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <Plus className="h-4 w-4" />
                    <span>Prompt</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="p-4 space-y-2">
                <DialogHeader>
                    <DialogTitle>Create Prompt</DialogTitle>
                    <DialogDescription>
                        Create a new prompt for your project.
                    </DialogDescription>
                </DialogHeader>
                <PromptForm onSubmit={handleCreatePrompt} projectId={projectId} />
            </DialogContent>
        </Dialog>
    )
}
