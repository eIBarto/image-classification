"use client"

import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';


import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable, RowSelectionState } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { columns } from "./view-file-columns";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { UnorderedList } from "./unordered-list";

const client = generateClient<Schema>()

interface PageData {
    items: Array<Schema["ViewFileProxy1"]["type"]>
    previousToken: string | null
    nextToken: string | null
}

async function listViewFiles(options: Schema["listViewFilesProxy"]["args"]): Promise<Schema["ListViewFilesResponse"]["type"]> {
    const { data, errors } = await client.queries.listViewFilesProxy(options)

    if (errors) {
        console.error("Failed to fetch files", errors)
        throw new Error("Failed to fetch files")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function deleteViewFile(options: Schema["deleteViewFileProxy"]["args"]): Promise<Schema["ViewFileProxy1"]["type"]> {
    const { data, errors } = await client.mutations.deleteViewFileProxy(options)

    if (errors) {
        console.error("Failed to delete project file", errors)
        throw new Error("Failed to delete project file")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function createLabel(options: Schema["createLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.createLabelProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}


async function setViewFileLabel(options: Schema["setViewFileLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.setViewFileLabelProxy(options)

    if (errors) {
        console.error("Failed to set view file label", errors)
        throw new Error("Failed to set view file label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
    viewId: string
}

export function View({ projectId, viewId, className, ...props }: ViewProps) {
    const queryClient = useQueryClient()

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const { data, error, isLoading } = useInfiniteQuery({
        queryKey: ["project-view-files", projectId, viewId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listViewFiles({ projectId: projectId, viewId: viewId, nextToken: pageParam, imageOptions: { width: 1024, height: 1024, format: "webp" } })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch view files")
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
        onRowSelectionChange: setRowSelection,
        initialState: { // todo might move to state 
            columnVisibility: {
                createdAt: false,
                updatedAt: false,
            },
        },
        state: {
            columnFilters,
            sorting,
            rowSelection,
        },
        meta: {
            onRowAction: handleRowAction
        }
    })



    async function handleRowAction(action: string, row: any) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "delete":
                    await deleteViewFileMutation.mutateAsync({ projectId: projectId, viewId: viewId, fileId: row.fileId })
                    break
                case "update":
                    //await updatePromptVersionMutation.mutateAsync({ projectId: projectId, promptId: promptId, version: row.version, text: row.text })
                    break
                case "create":
                    await createLabelMutation.mutateAsync({ projectId: projectId, name: row.name, description: row.description })
                    break
                case "set":
                    await setViewFileLabelMutation.mutateAsync({ projectId: projectId, viewId: viewId, fileId: row.fileId, labelId: row.labelId })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }

    const deleteViewFileMutation = useMutation({
        mutationFn: deleteViewFile,
        onSuccess: (file) => {
            if (!file) return;
            queryClient.setQueryData(["project-view-files", projectId, viewId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
                if (!data) return data;

                const { pages, ...rest } = data;

                return {
                    pages: pages.map(({ items, ...page }) => ({
                        ...page,
                        items: items.filter(({ fileId }) => fileId !== file.fileId)
                    })),
                    ...rest
                };
            })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete view file")
        }
    })

    const setViewFileLabelMutation = useMutation({
        mutationFn: setViewFileLabel,
        onSuccess: (data) => {
            console.log("MARK: data", data)
            queryClient.invalidateQueries({ queryKey: ["project-view-files", projectId, viewId] })
            //append(data) // TODO DO MORE HERE

        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to set view file label")
        }
    })

    const createLabelMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: (data) => {
            console.log("MARK: data", data)
            queryClient.invalidateQueries({ queryKey: ["project-view-files", projectId, viewId] })
            //append(data) // TODO DO MORE HERE
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create label")
        }
    })


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
                    <UnorderedList table={table} className="max-w-4xl mx-auto w-full auto-rows-min gap-4 md:grid-cols-4" />
                ) : <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No prompt versions found</p>
                </div>}
            </ScrollArea>
        </div>
    )
}