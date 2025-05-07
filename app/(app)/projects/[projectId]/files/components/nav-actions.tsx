"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"


//import { LabelForm, LabelFormSchema } from "../../components/label-form"
//import { columns } from "./label-columns"
//import { DataTableSortingOptions } from "./data-table-sorting-options"
import { ProjectFileUpload } from "./project-file-upload"


export interface NavActionsProps {
    projectId: string
    userId: string
}


export function NavActions({ projectId, userId }: NavActionsProps) {
    //const router = useRouter()
    //const queryClient = useQueryClient()
    //
    //const [sorting, setSorting] = useState<SortingState>([])
    //const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    //const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ data: true, createdAt: false, updatedAt: false })
    //const [isOpen, setIsOpen] = useState(false)
    //
    //const { data, error, isLoading } = useInfiniteQuery({
    //    queryKey: ["project-prompt-labels", projectId, promptId],
    //    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
    //        const { items, nextToken = null } = await listPromptLabels({
    //            projectId,
    //            promptId,
    //            nextToken: pageParam
    //        })
    //        return { items, previousToken: pageParam, nextToken }
    //    },
    //    initialPageParam: null,
    //    getPreviousPageParam: (firstPage) => firstPage.previousToken,
    //    getNextPageParam: (lastPage) => lastPage.nextToken
    //})
    //
    //useEffect(() => {
    //    if (error) {
    //        console.error(error)
    //        toast.error("Failed to fetch prompt labels")
    //    }
    //}, [error])
    //
    //const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])
    //
    //const table = useReactTable({
    //    data: items,
    //    columns: columns,
    //    getRowId: row => row.id,
    //    onColumnFiltersChange: setColumnFilters,
    //    onSortingChange: setSorting,
    //    onColumnVisibilityChange: setColumnVisibility,
    //    getCoreRowModel: getCoreRowModel(),
    //    getFilteredRowModel: getFilteredRowModel(),
    //    getSortedRowModel: getSortedRowModel(),
    //    state: {
    //        columnFilters,
    //        sorting,
    //        columnVisibility,
    //    },
    //    meta: {
    //        onRowAction: handleRowAction
    //    }
    //})
    //
    //async function handleRowAction(action: string, row: Schema["LabelProxy2"]["type"] | undefined) {
    //    try {
    //        if (!row) {
    //            throw new Error("No row provided")
    //        }
    //        switch (action) {
    //            case "update":
    //                await updateLabelMutation.mutateAsync({ projectId: projectId, id: row.id, name: row.name, description: row.description })
    //                break
    //            case "delete":
    //                await deleteLabelMutation.mutateAsync({ projectId: projectId, id: row.id })
    //                break
    //            default:
    //                throw new Error(`Invalid action: ${action}`)
    //        }
    //    } catch (error) {
    //        console.error(error)
    //        toast.error("Failed to handle row action")
    //    }
    //}
    //
    //const createLabelMutation = useMutation({
    //    mutationFn: createLabel,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
    //        setIsOpen(false)
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to create label")
    //    }
    //})
    //
    //const updateLabelMutation = useMutation({
    //    mutationFn: updateLabel,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to update label")
    //    }
    //})
    //
    //const deleteLabelMutation = useMutation({
    //    mutationFn: deleteLabel,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId, promptId] })
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to delete label")
    //    }
    //})
    //
    //const deletePromptMutation = useMutation({
    //    mutationFn: deletePrompt,
    //    onSuccess: (data) => {
    //        queryClient.invalidateQueries({ queryKey: ["project-prompts", projectId] })
    //        router.replace(`/projects/${projectId}/prompts`)
    //    },
    //    onError: (error) => {
    //        console.error(error)
    //        toast.error("Failed to delete prompt")
    //    }
    //})
    //
    //async function handleCreateLabel(values: LabelFormSchema) {
    //    await createLabelMutation.mutateAsync({ projectId: projectId, name: values.name, description: values.description, promptId: promptId })
    //}
    //
    //async function handleDeletePrompt() {
    //    await deletePromptMutation.mutateAsync({ projectId: projectId, id: promptId })
    //}

    return (
        <div className="flex items-center gap-2 text-sm">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload file</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    className="h-screen flex flex-col"
                >
                    <SheetHeader>
                        <SheetTitle>Uploads</SheetTitle>
                        <SheetDescription>
                            Upload files to this project.
                        </SheetDescription>
                    </SheetHeader>
                    <ProjectFileUpload projectId={projectId} userId={userId} />
                    {/*<div className="flex items-center gap-2 justify-between">
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
                        </ul> : table.getRowCount() > 0 ? <UnorderedList table={table} /> : <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">No labels found</p>
                        </div>}
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
                                        Create a new label for this prompt.
                                    </DialogDescription>
                                </DialogHeader>
                                mock
                            </DialogContent>
                        </Dialog>
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">
                                Done
                            </Button>
                        </SheetClose>
                    </SheetFooter>*/}
                </SheetContent>
            </Sheet>
        </div>
    )
}
