"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable } from "@tanstack/react-table"
import { columns } from "./file-columns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnorderedList } from "./unordered-list";
import { Skeleton } from "@/components/ui/skeleton"

const client = generateClient<Schema>()

export interface FilesProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

async function listProjectFiles(options: Schema["listProjectFilesProxy"]["args"]): Promise<Schema["ListProjectFilesResponse"]["type"]> {
    const { data, errors } = await client.queries.listProjectFilesProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch files")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}


/*
async function getProjectFile(options: Schema["getProjectFileProxy"]["args"]): Promise<Schema["ProjectFileProxy"]["type"]> {
    const { data, errors } = await client.queries.getProjectFileProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to get file")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}
*/

// TODO FETCH NEXT PAGE
export function Files({ projectId, className, ...props }: FilesProps) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        data,
        //fetchNextPage,
        isLoading,
        //hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["project-files", projectId],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ProjectFileProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listProjectFiles({ projectId: projectId, nextToken: pageParam, imageOptions: { width: 64, height: 64, format: "webp" } })

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

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const table = useReactTable({
        data: items,
        columns: columns,
        getRowId: row => row.fileId,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { // todo might move to state 
            columnVisibility: {
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

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter views..."
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
                    <p className="text-sm text-muted-foreground">No views found</p>
                </div>}
            </ScrollArea>
        </div>
    )
}
