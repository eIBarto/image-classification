"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "./data-table"


import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query"
import {
    useState,
    useEffect,
    useMemo,
} from "react"
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { columns } from "./project-membership-table-columns";

import { toast } from "sonner"
import { DataTableToolbar } from "./data-table-toolbar";
const client = generateClient<Schema>();



async function listProjectMembers(options: Schema["listProjectMembershipsByProjectProxy"]["args"]): Promise<Schema["ListProjectMembershipsResponse"]["type"]> {
    console.log("options", options)
    const { data, errors } = await client.queries.listProjectMembershipsByProjectProxy(options)

    console.log("data", data)
    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects memberships")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    //const [item] = data.items
    //data.items = Array.from({ length: 100 }, () => ({ ...item, accountId: Math.random().toString() }))

    return data
}

async function deleteProjectMembership(options: Schema["deleteProjectMembershipProxy"]["args"]): Promise<Schema["ProjectMembershipProxy"]["type"]> {
    const { data, errors } = await client.mutations.deleteProjectMembershipProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete project membership")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function updateProjectMembership(options: Schema["updateProjectMembershipProxy"]["args"]): Promise<Schema["ProjectMembershipProxy"]["type"]> {
    const { data, errors } = await client.mutations.updateProjectMembershipProxy(options)

    if (errors) {
        console.error(errors)
        console.log("options", options)
        throw new Error("Failed to update project membership")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

export interface MembersProps {
    projectId: string
}

export function Members({ projectId }: MembersProps) {
    const { ref, inView } = useInView()
    const queryClient = useQueryClient()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        //fetchPreviousPage,
        //isFetchingPreviousPage,
        isLoading,
        hasNextPage,
        //hasPreviousPage,
        //dataUpdatedAt,
        error,
    } = useInfiniteQuery({
        queryKey: ["project-memberships", projectId],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ProjectMembershipProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listProjectMembers({ projectId: projectId, nextToken: pageParam })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const table = useReactTable({
        data: items,
        columns,
        getRowId: row => row.accountId,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        meta: {
            onRowAction: handleRowAction
        },
    })

    useEffect(() => {
        if (!inView) {
            return
        }
        fetchNextPage()
    }, [fetchNextPage, inView])

    const deleteProjectMembershipMutation = useMutation({
        mutationFn: deleteProjectMembership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete project membership")
        }
    })

    const updateProjectMembershipMutation = useMutation({
        mutationFn: updateProjectMembership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update project membership")
        }
    })

    function handleRowAction(action: string, record: Schema["ProjectMembershipProxy"]["type"] | undefined) {
        try {
            switch (action) {
                case "delete":
                    if (!record) {
                        throw new Error("Record is undefined")
                    }
                    deleteProjectMembershipMutation.mutate({
                        projectId: projectId,
                        accountId: record.accountId,
                    })
                    break
                case "update":
                    if (!record) {
                        throw new Error("Record is undefined")
                    }
                    updateProjectMembershipMutation.mutate({
                        projectId: projectId,
                        accountId: record.accountId,
                        access: record.access,
                    })
                    break
                default:
                    throw new Error(`Unknown action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update project membership")
        }
    }

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch project memberships")
        }
    }, [error])

    return (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
            <div className="mx-auto container">
                <DataTableToolbar table={table} />
            </div>
            <ScrollArea className="flex-1">
                <div className="mx-auto container">
                    <DataTable table={table} columns={columns} tableHeaderProps={{ className: "sticky top-0 z-10 bg-background rounded-t-md after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-border" }} />
                    <div className="flex items-center justify-between text-xs p-2">
                        <Button
                            ref={ref}
                            variant="ghost"
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
                </div>
            </ScrollArea>
            <div className="mx-auto container">
                footer
            </div>
        </div>
    )
}