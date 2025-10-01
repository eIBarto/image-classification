"use client"

import { Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UnorderedList } from "./unordered-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { LabelForm, LabelFormSchema } from "../../components/label-form"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { columns } from "./label-columns"
import { DataTableSortingOptions } from "./data-table-sorting-options"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const client = generateClient<Schema>();

export interface NavActionsProps {
    projectId: string
    promptId: string
}

async function listPromptLabels(options: Schema["listPromptLabelsProxy"]["args"]) {
    const { data, errors } = await client.queries.listPromptLabelsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects labels")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function createLabel(options: Schema["createLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.createLabelProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function updateLabel(options: Schema["updateLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateLabelProxy(options)
    if (errors) {
        console.error(errors)
        throw new Error("Failed to update label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("Failed to update label")
    }

    return data
}

async function deleteLabel(options: Schema["deleteLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteLabelProxy(options)
    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("Failed to delete label")
    }

    return data
}

export function NavActions({ projectId, promptId }: NavActionsProps) {
    const queryClient = useQueryClient()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ data: true, createdAt: false, updatedAt: false })
    const [isOpen, setIsOpen] = useState(false)

    const { data, error, isLoading } = useInfiniteQuery({
        queryKey: ["project-prompt-labels", projectId, promptId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listPromptLabels({
                projectId,
                promptId,
                nextToken: pageParam
            })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch prompt labels")
        }
    }, [error])

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const table = useReactTable({
        data: items,
        columns: columns,
        getRowId: row => row.id,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters,
            sorting,
            columnVisibility,
        },
        meta: {
            onRowAction: handleRowAction
        }
    })

    async function handleRowAction(action: string, row: Schema["LabelProxy2"]["type"] | undefined) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "update":
                    await updateLabelMutation.mutateAsync({ projectId: projectId, id: row.id, name: row.name, description: row.description })
                    break
                case "delete":
                    await deleteLabelMutation.mutateAsync({ projectId: projectId, id: row.id })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }

    const createLabelMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
            setIsOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create label")
        }
    })

    const updateLabelMutation = useMutation({
        mutationFn: updateLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update label")
        }
    })

    const deleteLabelMutation = useMutation({
        mutationFn: deleteLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete label")
        }
    })

    async function handleCreateLabel(values: LabelFormSchema) {
        await createLabelMutation.mutateAsync({ projectId: projectId, name: values.name, description: values.description, promptId: promptId })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <Tags className="h-4 w-4" />
                    <span className="sr-only">Labels</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>Labels</SheetTitle>
                    <SheetDescription>
                        Manage your labels for this prompt.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex items-center gap-2 justify-between">
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
                    </ul> : table.getRowCount() > 0 ? <UnorderedList table={table} /> : <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">No labels found</p>
                    </div>}
                </ScrollArea>
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                            <LabelForm onSubmit={handleCreateLabel} />
                        </DialogContent>
                    </Dialog>
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
