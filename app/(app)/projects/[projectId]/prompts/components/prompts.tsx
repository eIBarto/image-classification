"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable } from "@tanstack/react-table"
import { columns } from "./prompt-columns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnorderedList } from "./unordered-list";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

const client = generateClient<Schema>()

export interface PromptsProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}
// todo loading state
// todo list aus nav-actions auslagern
async function listPrompts(options: Schema["listPromptsProxy"]["args"]) {
    const { data, errors } = await client.queries.listPromptsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch prompts")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

//async function createPrompt(options: Schema["createPromptProxy"]["args"]) {
//    const { data, errors } = await client.mutations.createPromptProxy(options)
//
//    if (errors) {
//        console.error(errors)
//        throw new Error("Failed to create prompt")
//    }
//
//    if (!data) {
//        console.error("No data returned")
//        throw new Error("No data returned")
//    }
//
//    return data
//}

async function updatePrompt(options: Schema["updatePromptProxy"]["args"]) {
    const { data, errors } = await client.mutations.updatePromptProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to update prompt")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function deletePrompt(options: Schema["deletePromptProxy"]["args"]) {
    const { data, errors } = await client.mutations.deletePromptProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete prompt")
    }

    return data
}

export function Prompts({ projectId, className, ...props }: PromptsProps) {
    const queryClient = useQueryClient()
    const { ref, inView } = useInView()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["prompts", projectId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listPrompts({ projectId: projectId, nextToken: pageParam })
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
        getRowId: row => row.id,
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

    const updatePromptMutation = useMutation({
        mutationFn: updatePrompt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prompts", projectId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update label")
        }
    })

    const deletePromptMutation = useMutation({
        mutationFn: deletePrompt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prompts", projectId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete label")
        }
    })

    async function handleRowAction(action: string, row: Schema["PromptProxy"]["type"] | undefined) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "update":
                    await updatePromptMutation.mutateAsync({ projectId: projectId, id: row.id, summary: row.summary, description: row.description })
                    break
                case "delete":
                    await deletePromptMutation.mutateAsync({ projectId: projectId, id: row.id })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter prompts..."
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
        </div>
    )
}