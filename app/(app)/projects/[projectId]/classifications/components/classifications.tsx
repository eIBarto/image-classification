"use client"

import { useInfiniteQuery/*, useMutation, useQueryClient */ } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable } from "@tanstack/react-table"
import { columns } from "./classifications-columns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnorderedList } from "./unordered-list";
import { Skeleton } from "@/components/ui/skeleton"

const client = generateClient<Schema>()

export interface ClassificationsProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}
// todo loading state
// todo list aus nav-actions auslagern
async function listClassifications(options: Schema["listClassificationsProxy"]["args"]): Promise<Schema["ListClassificationsResponse"]["type"]> {
    const { data, errors } = await client.queries.listClassificationsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects classifications")
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
//
//async function updatePrompt(options: Schema["updatePromptProxy"]["args"]) {
//    const { data, errors } = await client.mutations.updatePromptProxy(options)
//
//    if (errors) {
//        console.error(errors)
//        throw new Error("Failed to update prompt")
//    }
//
//    if (!data) {
//        console.error("No data returned")
//        throw new Error("No data returned")
//    }
//
//    return data
//}
//
//async function deletePrompt(options: Schema["deletePromptProxy"]["args"]) {
//    const { data, errors } = await client.mutations.deletePromptProxy(options)
//
//    if (errors) {
//        console.error(errors)
//        throw new Error("Failed to delete prompt")
//    }
//
//    return data
//}


// TODO FETCH NEXT PAGE
export function Classifications({ projectId, className, ...props }: ClassificationsProps) {
    //const queryClient = useQueryClient()

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        data,
        //fetchNextPage,
        isLoading,
        //hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["classifications", projectId],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ClassificationProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listClassifications({ projectId: projectId, nextToken: pageParam/*, query: query*/ })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch classifications")
        }
    }, [error])

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
        //meta: {
        //    onRowAction: handleRowAction
        //}
    })

    //const updatePromptMutation = useMutation({
    //    mutationFn: updatePrompt,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompts", projectId] })
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to update label")
    //    }
    //})
//
    //const deletePromptMutation = useMutation({
    //    mutationFn: deletePrompt,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompts", projectId] })
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to delete label")
    //    }
    //})
//
    //async function handleRowAction(action: string, row: Schema["PromptProxy"]["type"] | undefined) {
    //    try {
    //        if (!row) {
    //            throw new Error("No row provided")
    //        }
    //        switch (action) {
    //            case "update":
    //                await updatePromptMutation.mutateAsync({ projectId: projectId, id: row.id, summary: row.summary, description: row.description })
    //                break
    //            case "delete":
    //                await deletePromptMutation.mutateAsync({ projectId: projectId, id: row.id })
    //                break
    //            default:
    //                throw new Error(`Invalid action: ${action}`)
    //        }
    //    } catch (error) {
    //        console.error(error)
    //        toast.error("Failed to handle row action")
    //    }
    //}

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter classifications..."
                    value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("data")?.setFilterValue(event.target.value)
                    }
                />
                <DataTableSortingOptions table={table} />
            </div>
            <ScrollArea className="flex-1 @container/main">
                {isLoading ? (
                    <ul className="max-w-4xl mx-auto w-full space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <li key={`loading-${index}`} className="p-4 border rounded-lg">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : table.getRowCount() > 0 ? (
                    <UnorderedList table={table} className="max-w-4xl mx-auto w-full" />
                ) : <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No classifications found</p>
                </div>}
            </ScrollArea>
        </div>
    )
}