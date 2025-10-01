"use client"
/**
 * Project list with infinite scroll and filtering
 */

import { useInfiniteQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable } from "@tanstack/react-table"
import { columns } from "./project-columns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnorderedList } from "./unordered-list";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";

const client = generateClient<Schema>()

export type ProjectsProps = React.HTMLAttributes<HTMLDivElement>

async function listProjects(options: Schema["listProjectsProxy"]["args"]) {
    const { data, errors } = await client.queries.listProjectsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects projects")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export function Projects({ className, ...props }: ProjectsProps) {

    const { ref, inView } = useInView()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        data,
        fetchNextPage,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["projects-infinite"],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ProjectProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listProjects({ nextToken: pageParam })

            return { items: items.map(item => item.project), previousToken: pageParam, nextToken }
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
                name: false,
            },
        },
        state: {
            columnFilters,
            sorting,
        },

    })

    useEffect(() => {
        if (inView) {
            fetchNextPage()
        }
    }, [inView, fetchNextPage])

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter projects..."
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