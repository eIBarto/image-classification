"use client"

import { Plus } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"
//import { PromptForm, PromptFormSchema } from "./prompt-form"
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
                {/*<div className="flex items-center gap-2 justify-between">
                    <Input placeholder="Filter labels..."
                        value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("data")?.setFilterValue(event.target.value)
                        }
                    />
                    <DataTableSortingOptions table={table} />
                </div>
                <ScrollArea className="flex-1">
                    {isLoading ? <ul className="max-w-4xl mx-auto w-full space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <li key={`loading-${index}`} className="p-4 border rounded-lg">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </li>
                        ))}
                    </ul> : table.getRowCount() > 0 ? <DataTable table={table} columns={columns} /> : <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">No labels found</p>
                    </div>}
                </ScrollArea>*/}
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    {/*<Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                Create
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Label</DialogTitle>
                                <DialogDescription>
                                    Create a new label for this prompt.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>*/}
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
