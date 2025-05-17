"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState/*, VisibilityState */ } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { DataTableSortingOptions } from "./data-table-sorting-options"
import { toast } from "sonner"
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useState, useMemo, useEffect } from "react"
import { columns } from "./project-file-columns"
import { UnorderedList } from "./unordered-list"

const client = generateClient<Schema>()

export interface FilesProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

async function listProjectFiles(options: Schema["listProjectFilesProxy"]["args"]): Promise<Schema["ListProjectFilesResponse"]["type"]> {
    const { data, errors } = await client.queries.listProjectFilesProxy(options)

    if (errors) {
        throw new Error("Failed to fetch files")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}


async function getProjectFile(options: Schema["getProjectFileProxy"]["args"]): Promise<Schema["ProjectFileProxy"]["type"]> {
    const { data, errors } = await client.queries.getProjectFileProxy(options)

    if (errors) {
        throw new Error("Failed to get file")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function deleteProjectFile(options: Schema["deleteProjectFileProxy"]["args"]): Promise<Schema["ProjectFileProxy"]["type"]> {
    const { data, errors } = await client.mutations.deleteProjectFileProxy(options)

    if (errors) {
        throw new Error("Failed to delete project file")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

export interface PageData {
    items: Array<Schema["ProjectFileProxy"]["type"]>
    previousToken: string | null
    nextToken: string | null
}

export function Files({ projectId, className, ...props }: FilesProps) {
    const { ref, inView } = useInView()
    const queryClient = useQueryClient()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})


    const {
        data,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["project-files", projectId/*globalFilter*/],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<PageData> => {
            const { items, nextToken = null } = await listProjectFiles({ projectId: projectId, nextToken: pageParam/*, query: globalFilter*/, imageOptions: { width: 1024, height: 1024, format: "webp" } })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch files")
        }
    }, [error])

    useEffect(() => {
        if (inView) {
            fetchNextPage()
        }
    }, [fetchNextPage, inView])

    const table = useReactTable({
        data: items,
        columns,
        getRowId: row => row.fileId,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        //onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            columnVisibility: {
                "createdAt": false,
                "updatedAt": false,
                "name": false,
            },
            //globalFilter,
        },
        meta: {
            onRowAction: handleRowAction
        },
        //manualFiltering: true,
    })

    const deleteProjectFileMutation = useMutation({
        mutationFn: deleteProjectFile,
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete file")
        },
        onSuccess: (file) => {
            if (!file) return;
            queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
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
    })

    const getProjectFileMutation = useMutation({
        mutationFn: getProjectFile,
        onError: (error) => {
            console.error(error)
            toast.error("Failed to get file")
        },
        onSuccess: (file) => {
            if (!file) return;
            queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
                if (!data || data.pages.length < 1) {
                    return {
                        pages: [{ items: [file], nextToken: null, previousToken: null }],
                        pageParams: [null]
                    };
                }

                const updatedPages = [...data.pages];
                const lastPageIndex = updatedPages.length - 1;

                updatedPages[lastPageIndex] = {
                    ...updatedPages[lastPageIndex],
                    items: [...updatedPages[lastPageIndex].items, file]
                };

                return {
                    ...data,
                    pages: updatedPages
                };
            });
        },
    })


    useEffect(() => {
        const subscription = client.models.ProjectFile.onCreate({
            filter: {
                and: [
                    { projectId: { eq: projectId } },
                ]
            },
        }).subscribe({
            next: (file) => {
                getProjectFileMutation.mutate({ projectId, fileId: file.fileId, imageOptions: { width: 1024, height: 1024, format: "webp" } });
            },
            error: (error) => {
                toast.error("Failed to subscribe to file creation")
                console.error('onCreate subscription error:', error)
            }
        });

        return () => subscription.unsubscribe();
    }, [projectId, getProjectFileMutation]);

    useEffect(() => {
        const subscription = client.models.ProjectFile.onDelete({
            filter: {
                projectId: { eq: projectId }
            },
            // selectionSet: ["id"]
        }).subscribe({
            next: (file) => {
                queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
                    if (!data) return data;

                    const { pages, ...rest } = data;

                    return {
                        pages: pages.map(({ items, ...page }) => ({
                            ...page,
                            items: items.filter(({ fileId }) => fileId !== file.fileId)
                        })),
                        ...rest
                    };
                });
            },
            error: (error) => {
                console.error('Delete subscription error:', error)
            }
        });

        return () => subscription.unsubscribe();
    }, [projectId, queryClient/*, globalFilter*/]);



    async function handleRowAction(action: string, record: Schema["ProjectFileProxy"]["type"] | undefined) { // todo here 
        try {
            switch (action) {
                case "delete":
                    if (!record) {
                        throw new Error("Record is undefined")
                    }
                    await deleteProjectFileMutation.mutateAsync({
                        fileId: record.fileId,
                        projectId: record.projectId,
                    })
                    break
                default:
                    throw new Error(`Unknown action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        }
    }

    return (
        <div className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)} {...props}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full ">
                <Input placeholder="Filter files..."
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
                        size="sm"
                        disabled={!hasNextPage || isFetchingNextPage}
                        className="w-full text-xs"
                        onClick={() => fetchNextPage()}
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