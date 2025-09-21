"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PlusCircleIcon } from "lucide-react"
import { generateClient } from 'aws-amplify/data';
import { ColumnFiltersState, getCoreRowModel, getFilteredRowModel, Row, RowSelectionState, Table, useReactTable } from "@tanstack/react-table";
import type { Schema } from "@/amplify/data/resource"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useMemo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { columns } from "./gold-standard-selection-columns"
import { DynamicCommandGroup } from "./dynamic-command-group";
import { Input } from "@/components/ui/input";
import { LabelForm, LabelFormSchema } from "./label-form";

const client = generateClient<Schema>();

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

export interface GoldStandardSelectionProps {
    table: Table<Schema["ViewFileProxy1"]["type"]>
    row: Row<Schema["ViewFileProxy1"]["type"]>
}

export function GoldStandardSelection({ row, table }: GoldStandardSelectionProps) {
    const queryClient = useQueryClient()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const { viewId, labelId, view } = row.original
    const { projectId } = view
    const [isOpen, setIsOpen] = useState(false)

    const rowSelection = useMemo<RowSelectionState>(() => labelId ? { [labelId]: true } : {}, [labelId])

    const { data, error } = useInfiniteQuery({
        queryKey: ["project-view-file-labels", projectId, viewId],
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

    const createLabelMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-prompt-labels", projectId] })
            setIsOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create label")
        }
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch view labels")
        }
    }, [error])

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    const labelsTable = useReactTable({
        data: items,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => row.id,
        state: {
            columnFilters,
            rowSelection,
        },

        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: (updater) => {
            const newRowSelection = updater instanceof Function ? updater(rowSelection) : updater
            const [labelId] = Object.keys(newRowSelection)
            console.log(labelId)

            table.options.meta?.onRowAction?.("set-gold-standard", { ...row.original, labelId: labelId ?? null })
        },
        enableMultiRowSelection: false,
    })

    const [open, setOpen] = useState(false)

    const label = useMemo(() => items.find((item) => item.id === labelId), [items, labelId])

    async function handleCreateLabel(values: LabelFormSchema) {
        await createLabelMutation.mutateAsync({ projectId: projectId, name: values.name, description: values.description  })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-auto h-auto text-[10px] px-1.5 py-0.5 data-[state=open]:bg-muted data-[state=open]:text-black bg-black/20 text-white/70 border-0 justify-between"
                >
                    {label
                        ? label.name
                        : "Select Gold Standard"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <Input
                        placeholder="Search labels..."
                        className="flex h-10 w-full border-none rounded-none outline-none bg-transparent py-3 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={(labelsTable.getColumn("data")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            labelsTable.getColumn("data")?.setFilterValue(event.target.value)
                        }
                    />
                    <CommandList>
                        <DynamicCommandGroup table={labelsTable} />
                        <CommandGroup>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <CommandItem onSelect={() => setIsOpen(true)}>
                                    <PlusCircleIcon />
                                    Create label
                                </CommandItem>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create label</DialogTitle>
                                        <DialogDescription>
                                            Create a new label for your project.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <LabelForm onSubmit={handleCreateLabel} />
                                </DialogContent>
                            </Dialog>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}