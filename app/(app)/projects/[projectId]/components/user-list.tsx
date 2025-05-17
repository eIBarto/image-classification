import { generateClient } from 'aws-amplify/data';
import { Schema } from "@/amplify/data/resource";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query"
import { useEffect, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { columns } from "./user-list-columns";
import { DataTable } from "./data-table"; // todo move to its own file
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const client = generateClient<Schema>();

async function listProjectMembers(options: Schema["listProjectMembershipsByProjectProxy"]["args"]): Promise<Schema["ListProjectMembershipsResponse"]["type"]> {
    const { data, errors } = await client.queries.listProjectMembershipsByProjectProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects memberships")
    }

    if (!data) {
        throw new Error("No data returned")
    }

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

export interface UserListProps {
    projectId: string
}

export function UserList({ projectId }: UserListProps) {
    const queryClient = useQueryClient()
    
    const { ref, inView } = useInView()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
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

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch project memberships")
        }
    }, [error])

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

    async function handleRowAction(action: string, record: Schema["ProjectMembershipProxy"]["type"] | undefined) {
        try {
            switch (action) {
                case "delete":
                    if (!record) {
                        throw new Error("Record is undefined")
                    }
                    await deleteProjectMembershipMutation.mutateAsync({
                        projectId: projectId,
                        accountId: record.accountId,
                    })
                    break
                case "update":
                    if (!record) {
                        throw new Error("Record is undefined")
                    }
                    await updateProjectMembershipMutation.mutateAsync({
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
        if (!inView) {
            return
        }
        fetchNextPage()
    }, [fetchNextPage, inView])

    return (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
            <ScrollArea className="flex-1">
                <div className="mx-auto container">
                    <DataTable table={table} columns={columns} /*tableHeaderProps={{ className: "sticky top-0 z-10 bg-background rounded-t-md after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-border" }}*/ />
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
        </div>
    )
}