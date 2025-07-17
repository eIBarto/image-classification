"use client"

import { Tags, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UnorderedList } from "./unordered-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { LabelForm, LabelFormSchema } from "./label-form"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { columns } from "./label-columns"
import { DataTableSortingOptions } from "./data-table-sorting-options"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyticsSheet } from "./analytics-sheet"
import { useInView } from "react-intersection-observer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HelpCircle } from "lucide-react"

const client = generateClient<Schema>();

export interface NavActionsProps {
    projectId: string
    viewId: string
}

async function listLabels(options: Schema["listLabelsProxy"]["args"]) {
    const { data, errors } = await client.queries.listLabelsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects labels")
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

async function updateLabel(options: Schema["updateLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateLabelProxy(options)
    if (errors) {
        console.error(errors)
        throw new Error("Failed to update label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("Failed to update label")
    }

    return data
}

async function deleteLabel(options: Schema["deleteLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteLabelProxy(options)
    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("Failed to delete label")
    }

    return data
}

export function NavActions({ projectId, viewId }: NavActionsProps) {
    const { ref, inView } = useInView()
    const queryClient = useQueryClient()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ data: true, createdAt: false, updatedAt: false })
    const [isOpen, setIsOpen] = useState(false)

    const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["project-view-labels", projectId, viewId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listLabels({
                projectId,
                nextToken: pageParam
            })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch view labels")
        }
    }, [error])

    useEffect(() => {
        if (inView) {
            fetchNextPage()
        }
    }, [fetchNextPage, inView])

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const table = useReactTable({
        data: items,
        columns: columns,
        getRowId: row => row.id,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters,
            sorting,
            columnVisibility,
        },
        meta: {
            onRowAction: handleRowAction
        }
    })

    async function handleRowAction(action: string, row: Schema["LabelProxy2"]["type"] | undefined) {
        try {
            if (!row) {
                throw new Error("No row provided")
            }
            switch (action) {
                case "update":
                    await updateLabelMutation.mutateAsync({ projectId: projectId, id: row.id, name: row.name, description: row.description })
                    break
                case "delete":
                    await deleteLabelMutation.mutateAsync({ projectId: projectId, id: row.id })
                    break
                default:
                    throw new Error(`Invalid action: ${action}`)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to handle row action")
        }
    }

    const createLabelMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-view-labels", projectId, viewId] })
            setIsOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create label")
        }
    })

    const updateLabelMutation = useMutation({
        mutationFn: updateLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-view-labels", projectId, viewId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update label")
        }
    })

    const deleteLabelMutation = useMutation({
        mutationFn: deleteLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-view-labels", projectId, viewId] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete label")
        }
    })

    async function handleCreateLabel(values: LabelFormSchema) {
        await createLabelMutation.mutateAsync({ projectId: projectId, name: values.name, description: values.description })
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Hilfe</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-1.5 pt-0 overflow-hidden border-0 max-w-screen-lg">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Video-Anleitung</DialogTitle>
                        <DialogDescription>
                            This is a video tutorial for project actions.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="project-images" className="relative">
                        <TabsList className="absolute z-10 grid w-auto grid-cols-4 bottom-2 right-2">
                            <TabsTrigger value="view-images">Bilder und Gold-Standard</TabsTrigger>
                            <TabsTrigger value="view-labels">Labels</TabsTrigger>
                            <TabsTrigger value="view-evaluations">Ergebnisse</TabsTrigger>
                            <TabsTrigger value="view-actions">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="view-actions">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/view-actions.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="view-images">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/view-images.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="view-labels">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/view-labels.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="view-evaluations">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/view-evaluations.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost">
                        <Tags className="h-4 w-4" />
                        <span className="sr-only">Labels</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    className="h-screen flex flex-col"
                >
                    <SheetHeader>
                        <SheetTitle>Labels</SheetTitle>
                        <SheetDescription>
                            Manage your labels for this view.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex items-center gap-2 justify-between">
                        <Input placeholder="Filter labels..."
                            value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("data")?.setFilterValue(event.target.value)
                            }
                        />
                        <DataTableSortingOptions table={table} />
                    </div>
                    <ScrollArea className="flex-1">
                        {isLoading ? <ul className="max-w-4xl mx-auto w-full space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <li key={`loading-${index}`} className="p-4 border rounded-lg">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </li>
                            ))}
                        </ul> : table.getRowCount() > 0 ? <UnorderedList table={table} className="gap-4" /> : <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">No labels found</p>
                        </div>}
                        {hasNextPage && (
                            <div className="flex items-center justify-center">
                                <Button ref={ref} variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                                    {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                    <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    Create
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Label</DialogTitle>
                                    <DialogDescription>
                                        Create a new label for this view.
                                    </DialogDescription>
                                </DialogHeader>
                                <LabelForm onSubmit={handleCreateLabel} />
                            </DialogContent>
                        </Dialog>
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">
                                Done
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <AnalyticsSheet projectId={projectId} viewId={viewId} />
        </div>
    )
}
