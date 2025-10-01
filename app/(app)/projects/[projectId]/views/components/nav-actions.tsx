"use client"
/**
 * View creation sheet and trigger in header
 * - Creates a view and routes to its page on success
 */

import { Plus } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { ViewForm } from "./view-form"
import { ViewFormSchema } from "./view-form"

const client = generateClient<Schema>();

export interface NavActionsProps {
    projectId: string
}

async function createView(options: Schema["createViewProxy"]["args"]) {
    const { data, errors } = await client.mutations.createViewProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create view")
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

    const createViewMutation = useMutation({
        mutationFn: createView,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["views", projectId] })
            router.push(`/projects/${projectId}/views/${data.id}`)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create view")
        }
    })

    async function handleCreateView(values: ViewFormSchema) {
        await createViewMutation.mutateAsync({ projectId: projectId, ...values })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="border-dashed">
                    <Plus className="h-4 w-4" />
                    <span>Create View</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>Create View</SheetTitle>
                    <SheetDescription>
                        Create a new view for your project.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                    <ViewForm onSubmit={handleCreateView} projectId={projectId} />
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
