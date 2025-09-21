"use client"
/**
 * Classification creation sheet and trigger in header
 * - Creates a classification and routes to its page on success
 */

import { Plus } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { ClassificationForm, ClassificationFormSchema } from "./classification-form"
import { useState } from "react"

const client = generateClient<Schema>();

export interface NavActionsProps {
    projectId: string
}

async function createClassification(options: Schema["createClassificationProxy"]["args"]) {
    const { data, errors } = await client.mutations.createClassificationProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create classification")
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

    const createClassificationMutation = useMutation({
        mutationFn: createClassification,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["classifications", projectId] })
            setIsOpen(false)
            router.push(`/projects/${projectId}/classifications/${data.id}`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create classification")
        }
    })

    async function handleClassification(values: ClassificationFormSchema) {
        await createClassificationMutation.mutateAsync({ projectId: projectId, ...values })
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Create Classification</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>Create Classification</SheetTitle>
                    <SheetDescription>
                        Create a new classification for your project.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                    <ClassificationForm onSubmit={handleClassification} projectId={projectId} />
                </div>

                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">

                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                            Done
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
