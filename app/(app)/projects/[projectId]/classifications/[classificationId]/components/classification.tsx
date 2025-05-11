"use client"

import { useInfiniteQuery, useQueryClient, InfiniteData, useMutation } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';


import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable, RowSelectionState } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { columns } from "./classification-candidate-columns";
import { DataTableSortingOptions } from "./data-table-sorting-options";
import { UnorderedList } from "./unordered-list";

const client = generateClient<Schema>()

//interface PageData {
//    items: Array<Schema["ClassificationCandidateProxy1"]["type"]>
//    previousToken: string | null
//    nextToken: string | null
//}

async function listClassificationCandidates(options: Schema["listClassificationCandidatesProxy"]["args"]): Promise<Schema["ListClassificationCandidatesResponse"]["type"]> {
    const { data, errors } = await client.queries.listClassificationCandidatesProxy(options)

    if (errors) {
        console.error("Failed to fetch classification candidates", errors)
        throw new Error("Failed to fetch classification candidates")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function classifyClassificationCandidate(options: Schema["classifyCandidateProxy"]["args"]): Promise<Schema["ResultProxy1"]["type"]> {
    const { data, errors } = await client.mutations.classifyCandidateProxy(options)

    if (errors) {
        console.error("Failed to classify classification candidate", errors)
        throw new Error("Failed to classify classification candidate")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function deleteClassificationResult(options: Schema["deleteClassificationResultProxy"]["args"]): Promise<Schema["ResultProxy"]["type"]> {
    const { data, errors } = await client.mutations.deleteClassificationResultProxy(options)

    if (errors) {
        console.error("Failed to delete classification result", errors)
        throw new Error("Failed to delete classification result")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

//async function deleteClassificationCandidate(options: Schema["deleteClassificationCandidateProxy"]["args"]): Promise<Schema["ClassificationCandidateProxy1"]["type"]> {
//    const { data, errors } = await client.mutations.deleteClassificationCandidateProxy(options)
//
//    if (errors) {
//        console.error("Failed to delete project file", errors)
//        throw new Error("Failed to delete project file")
//    }
//
//    if (!data) {
//        console.error("No data returned")
//        throw new Error("No data returned")
//    }
//
//    return data
//}


export interface ClassificationProps extends React.HTMLAttributes<HTMLDivElement> {
    classificationId: string
    projectId: string
}

interface PageData {
    items: Array<Schema["ClassificationCandidateProxy1"]["type"]>
    previousToken: string | null
    nextToken: string | null
}

export function Classification({ classificationId, projectId, className, ...props }: ClassificationProps) {
    const queryClient = useQueryClient()

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const { data, error, isLoading } = useInfiniteQuery({
        queryKey: ["classification-candidates", classificationId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listClassificationCandidates({ classificationId: classificationId, nextToken: pageParam, imageOptions: { width: 1024, height: 1024, format: "webp" } })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch classification candidates")
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
        },
        enableRowSelection: false,
    })

    async function handleRowAction(action: string, row: Schema["ClassificationCandidateProxy1"]["type"] | undefined) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "delete":
                    //await deleteClassificationCandidateMutation.mutateAsync({ projectId: projectId, classificationId: classificationId, fileId: row.fileId })
                    if (!row.result) {
                        throw new Error("No result provided")
                    }
                    await deleteClassificationResultMutation.mutateAsync({ id: row.result.id, projectId: projectId })
                    break
                case "update":
                    //await updatePromptVersionMutation.mutateAsync({ projectId: projectId, promptId: promptId, version: row.version, text: row.text })
                    break
                case "classify":
                    console.log("classifyClassificationCandidateMutation::row", row)
                    await classifyClassificationCandidateMutation.mutateAsync({ classificationId: classificationId, fileId: row.fileId })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }


    // todo add deletion subscription
    useEffect(() => {
        const subscription = client.models.Result.onCreate({
            filter: {
                and: [
                    { classificationId: { eq: classificationId } },
                ]
            },
            selectionSet: ["id", "classificationId", "fileId", "labelId", "createdAt", "updatedAt", "confidence", "label.*"]
        }).subscribe({
            next: (result) => {
                console.log("onCreate::result", result)
                queryClient.setQueryData(["classification-candidates", classificationId], (data: InfiniteData<PageData> | undefined) => {
                    if (!data) return data;

                    const { pages, ...rest } = data;

                    return {
                        pages: pages.map(({ items, ...page }) => ({
                            ...page,
                            items: items.map(({ fileId, ...rest }) => fileId === result.fileId ? { ...rest, status: "COMPLETED", result: result, fileId } : { ...rest, fileId })
                        })),
                        ...rest
                    };
                });
            },
            error: (error) => {
                toast.error("Failed to subscribe to classification candidates")
                console.error('onCreate subscription error:', error)
            }
        });

        return () => subscription.unsubscribe();
    }, [classificationId, queryClient]);


    const classifyClassificationCandidateMutation = useMutation({
        mutationFn: classifyClassificationCandidate,
        onSuccess: (result) => {
            console.log("classifyClassificationCandidateMutation::result", result)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to classify classification candidate")
        }
    })

    const deleteClassificationResultMutation = useMutation({
        mutationFn: deleteClassificationResult,
        onSuccess: (result) => {
            queryClient.setQueryData(["classification-candidates", classificationId], (data: InfiniteData<PageData> | undefined) => {
                if (!data) return data;
                const { pages, ...rest } = data;

                return {
                    pages: pages.map(({ items, ...page }) => ({
                        ...page,
                        items: items.map(item => item.result?.id === result.id ? { ...item, result: null, resultId: null } : item)
                    })),
                    ...rest
                };
            })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete classification result")
        }
    })
    //const deleteClassificationCandidateMutation = useMutation({
    //    mutationFn: deleteClassificationCandidate,
    //    onSuccess: (file) => {
    //        if (!file) return;
    //        queryClient.setQueryData(["classification-candidates", projectId, classificationId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
    //            if (!data) return data;
    //
    //            const { pages, ...rest } = data;
    //
    //            return {
    //                pages: pages.map(({ items, ...page }) => ({
    //                    ...page,
    //                    items: items.filter(({ fileId }) => fileId !== file.fileId)
    //                })),
    //                ...rest
    //            };
    //        })
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to delete classification file")
    //    }
    //})

    return (
        <div {...props} className={cn("flex-1 flex flex-col overflow-hidden gap-4", className)}>
            <div className="flex items-center gap-2 justify-between max-w-4xl mx-auto w-full">
                <Input placeholder="Filter candidates..."
                    value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("data")?.setFilterValue(event.target.value)
                    }
                />
                <DataTableSortingOptions table={table} />
                {/*<DataTableViewOptions table={table} />*/}
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
                    <p className="text-sm text-muted-foreground">No candidates found</p>
                </div>}
            </ScrollArea>
        </div>
    )
}