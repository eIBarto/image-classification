"use client"
/**
 * Classifications list with infinite scroll and filtering
 */

import { useInfiniteQuery } from "@tanstack/react-query"
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

const client = generateClient<Schema>()

export interface ClassificationsProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

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

export function Classifications({ projectId, className, ...props }: ClassificationsProps) {

    const { ref, inView } = useInView()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        data,

        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
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
            const { items, nextToken = null } = await listClassifications({ projectId: projectId, nextToken: pageParam })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (inView) {
            fetchNextPage()
        }
    }, [inView, fetchNextPage])

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
        initialState: {
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

    })

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