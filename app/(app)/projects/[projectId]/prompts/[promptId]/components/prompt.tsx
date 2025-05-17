"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { PromptVersionForm, PromptVersionFormSchema } from "./prompt-version-form" // todo this component is shared with the create prompt page
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { cn } from "@/lib/utils"
import { toast } from "sonner";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react";
import { columns } from "./prompt-version-columns";
import { UnorderedList } from "./unordered-list";
import { Input } from "@/components/ui/input"
import { DataTableSortingOptions } from "./data-table-sorting-options"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"

const client = generateClient<Schema>()


// todo loading state

async function listPromptVersions(options: Schema["listPromptVersionsProxy"]["args"]) {
    const { data, errors } = await client.queries.listPromptVersionsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch prompt versions")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function createPromptVersion(options: Schema["createPromptVersionProxy"]["args"]) {
    const { data, errors } = await client.mutations.createPromptVersionProxy(options)

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

async function deletePromptVersion(options: Schema["deletePromptVersionProxy"]["args"]) {
    const { data, errors } = await client.mutations.deletePromptVersionProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete prompt version")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function updatePromptVersion(options: Schema["updatePromptVersionProxy"]["args"]) {
    const { data, errors } = await client.mutations.updatePromptVersionProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to update prompt version")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
    promptId: string
    projectId: string
}

export function Chat({ promptId, projectId, className, ...props }: ChatProps) {
    const queryClient = useQueryClient()
    const { ref, inView } = useInView()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["project-prompt-versions", projectId, promptId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listPromptVersions({ projectId: projectId, promptId: promptId, nextToken: pageParam })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch prompt versions")
        }
    }, [error])

    useEffect(() => {
        if (inView) {
            fetchNextPage()
        }
    }, [inView, fetchNextPage])

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const table = useReactTable({
        data: items,
        columns: columns,
        getRowId: row => row.version,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { // todo might move to state 
            columnVisibility: {
                version: false,
                createdAt: false,
                updatedAt: false,
            },
        },
        state: {
            columnFilters,
            sorting,
        },
        meta: {
            onRowAction: handleRowAction
        }
    })

    async function handleRowAction(action: string, row: Schema["PromptVersionProxy1"]["type"] | undefined) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "delete":
                    await deletePromptVersionMutation.mutateAsync({ projectId: projectId, promptId: promptId, version: row.version })
                    break
                case "update":
                    await updatePromptVersionMutation.mutateAsync({ projectId: projectId, promptId: promptId, version: row.version, text: row.text })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }

    const createPromptVersionMutation = useMutation({
        mutationFn: createPromptVersion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-versions", projectId, promptId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create prompt version")
        }
    })

    const deletePromptVersionMutation = useMutation({
        mutationFn: deletePromptVersion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-versions", projectId, promptId] })
        },
    })

    const updatePromptVersionMutation = useMutation({
        mutationFn: updatePromptVersion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-versions", projectId, promptId] })
        },
    })

    async function handlePromptVersion(values: PromptVersionFormSchema) {
        const { labels, ...rest } = values
        const items = labels.map((label) => label.id)
        await createPromptVersionMutation.mutateAsync({ ...rest, projectId: projectId, promptId: promptId, labels: items })
    }

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter versions..."
                    value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("data")?.setFilterValue(event.target.value)
                    }
                />
                <DataTableSortingOptions table={table} />
            </div>
            <ScrollArea className="flex-1 @container/main">
                <UnorderedList table={table} className="max-w-4xl mx-auto w-full" />
                <div className="flex items-center justify-between text-xs p-2">
                    <Button
                        ref={ref}
                        variant="ghost"
                        onClick={() => fetchNextPage()}
                        size="sm"
                        disabled={!hasNextPage || isFetchingNextPage}
                        className="w-full text-xs"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Loading...</>
                        ) : hasNextPage ? (
                            'Load more'
                        ) : (
                            'No more items'
                        )}
                    </Button>
                </div>

            </ScrollArea>
            <div className="px-4 flex justify-center">
                <Card className="w-full max-w-4xl p-2">
                    <PromptVersionForm projectId={projectId} promptId={promptId} onSubmit={handlePromptVersion} />
                </Card>
            </div>
        </div>
    )
}