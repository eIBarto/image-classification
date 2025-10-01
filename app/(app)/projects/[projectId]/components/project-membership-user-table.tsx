"use client"

import {
    useState,
    useEffect,
    useMemo,
} from "react"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useInfiniteQuery } from "@tanstack/react-query"

import {
    useReactTable,
    getCoreRowModel,
    VisibilityState,
    ColumnFiltersState,
    SortingState,
    getSortedRowModel,

} from '@tanstack/react-table';
import { columns } from "./project-membership-user-table-columns";
import { Input } from "@/components/ui/input";
import { DataTable } from "./data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
const client = generateClient<Schema>();

export interface ProjectMembershipUserTableProps {
    onSelect?: (users: Array<string>) => void
    value?: Array<string>
    isMulti?: boolean

}

async function listUsers(options: Schema["listUsersProxy"]["args"]) {
    const { data, errors } = await client.queries.listUsersProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects memberships")
    }

    if (!data) {
        console.error("No data")
        throw new Error("Failed to fetch projects memberships")
    }

    return data
}

export function ProjectMembershipUserTable({ onSelect, value, isMulti = false }: ProjectMembershipUserTableProps) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(value?.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {})
    const [globalFilter, setGlobalFilter] = useState("")

    useEffect(() => {
        onSelect?.(Object.entries(rowSelection).filter(([, value]) => value).map(([key,]) => key))
    }, [rowSelection, onSelect])

    const {
        data,

        error,
    } = useInfiniteQuery({
        queryKey: ["users", globalFilter],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["UserProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listUsers({ nextToken: pageParam, query: globalFilter })
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

        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        manualFiltering: true,
        enableMultiRowSelection: isMulti
    })

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="flex flex-col flex-1 overflow-y-hidden">
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Filter emails..."
                    value={table.getState().globalFilter}
                    onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                    }

                />
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
                <DataTable  columns={columns} table={table} />
            </ScrollArea>
        </div>
    )
}