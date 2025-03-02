"use client"

import {
    useState,
    useEffect,
    useMemo,
} from "react"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { RefreshCcw } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    VisibilityState,
    ColumnFiltersState,
    SortingState,
    getSortedRowModel,
    //getFilteredRowModel,
} from '@tanstack/react-table';
import { columns } from "./project-membership-user-table-columns";
import { Input } from "@/components/ui/input";
import { DataTable } from "./data-table";

const client = generateClient<Schema>();

export interface ProjectMembershipUserTableProps {
    onSelect?: (users: Array<string>) => void
    value?: Array<string>
    isMulti?: boolean
    // todo add disabled through props
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
 // TODO HANDLE LOADING STATE
 // todo components für header und footer?
export function ProjectMembershipUserTable({ onSelect, value, isMulti = false }: ProjectMembershipUserTableProps) { // todo add nextToken
    const { ref, inView } = useInView()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) // todo set default
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(value?.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {})
    const [globalFilter, setGlobalFilter] = useState("")

    useEffect(() => {
        onSelect?.(Object.entries(rowSelection).filter(([, value]) => value).map(([key,]) => key))
    }, [rowSelection, onSelect])

/*
    useEffect(() => { // todo validate this pattern
        setRowSelection(value?.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {})
    }, [value])
*/

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        fetchPreviousPage,
        isFetchingPreviousPage,
        isLoading,
        hasNextPage,
        hasPreviousPage,
        dataUpdatedAt,
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
        //getFilteredRowModel: getFilteredRowModel(),
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

    useEffect(() => {
        if (!inView) {
            return
        }
        fetchNextPage()
    }, [fetchNextPage, inView])

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Filter emails..."
                    value={table.getState().globalFilter}
                    onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                    }
                //className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <DataTable isLoading={isLoading} showHeaders={false} columns={columns} table={table} header={<div className="flex items-center justify-between text-xs">
                    <button
                        onClick={() => fetchPreviousPage()}
                        disabled={!hasPreviousPage || isFetchingPreviousPage}
                        className={cn(
                            "text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground",
                            (!hasPreviousPage || isFetchingPreviousPage) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isFetchingPreviousPage
                            ? 'Loading more...'
                            : hasPreviousPage
                                ? 'Load Older'
                                : 'Up to date'}
                    </button>
                </div>} footer={<div className="flex items-center justify-between text-xs">
                    <button
                        ref={ref}
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        className={cn(
                            "text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground",
                            (!hasNextPage || isFetchingNextPage) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isFetchingNextPage
                            ? 'Loading more...'
                            : hasNextPage
                                ? 'Load more'
                                : 'No more items'}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <RefreshCcw className="h-3 w-3" />
                        {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
                    </div>
                </div>} />
            </div>
        </>
    )
}

/*<ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
                {files.map(({ file, key, progress, id, status, uploadTask }) => (
                    <figure key={id} className="shrink-0 w-[150px]">
                        <div className="overflow-hidden rounded-md">
                            {file ? (
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={key}
                                    className="h-[200px] w-[150px] object-cover"
                                    width={150}
                                    height={200}
                                />
                            ) : (
                                <div className="flex h-[200px] w-[150px] items-center justify-center bg-muted">
                                    <File className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <figcaption className="pt-2 text-xs space-y-2">
                            <div className="font-medium text-foreground truncate max-w-[150px]">
                                {key}
                            </div>
                            <Progress value={progress} className="h-1" />
                            <div className="flex items-center justify-between text-muted-foreground">
                                {progress > -1 ? <span>{progress}%</span> : <span>{status}</span>}
                                <div className="flex gap-1">
                                    {status === 'paused' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            disabled={!uploadTask}
                                            onClick={() => uploadTask && onResume({ id, uploadTask })}
                                        >
                                            <Play className="h-3 w-3" />
                                            <span className="sr-only">{displayText.resumeButtonText}</span>
                                        </Button>
                                    )}
                                    {status === 'uploading' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            disabled={!uploadTask}
                                            onClick={() => uploadTask && onPause({ id, uploadTask })}
                                        >
                                            <Pause className="h-3 w-3" />
                                            <span className="sr-only">{displayText.pauseButtonText}</span>
                                        </Button>
                                    )}
                                    {status === 'uploading' && ( // status queued?
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            disabled={!uploadTask}
                                            onClick={() => uploadTask && onCancelUpload({ id, uploadTask })}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Cancel</span>
                                        </Button>
                                    )}
                                    {(status === 'uploaded' || status === 'paused' || status === 'added' || status === 'queued') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => onDeleteUpload({ id })}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </figcaption>
                    </figure>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>*/