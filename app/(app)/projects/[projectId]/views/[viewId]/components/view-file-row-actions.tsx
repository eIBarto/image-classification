"use client"

import { Row, Table } from "@tanstack/react-table"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuSub, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LabelForm, LabelFormSchema } from "./label-form"
import { Loader2, Plus } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useInfiniteQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Check } from "lucide-react"
const client = generateClient<Schema>();

export interface ViewFileRowActionsProps {
    table: Table<Schema["ViewFileProxy1"]["type"]>
    row: Row<Schema["ViewFileProxy1"]["type"]>
    projectId: string
    viewId: string
    shouldCloseDialogs?: boolean
}

async function listViewLabels(options: Schema["listViewLabelsProxy"]["args"]) {
    const { data, errors } = await client.queries.listViewLabelsProxy(options)

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

export function ViewFileRowActions({ row, table, projectId, viewId, shouldCloseDialogs = true }: ViewFileRowActionsProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, error, isLoading } = useInfiniteQuery({
        queryKey: ["project-view-labels", projectId, viewId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listViewLabels({
                projectId,
                viewId,
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

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function openEditDialog() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function openCreateLabelDialog() {
        setIsMenuOpen(false)
        setIsCreateLabelOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)
        setIsEditOpen(false)
        setIsCreateLabelOpen(false)
    }

    async function handleUpdateLabel(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("update", { ...row.original, ...values })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    async function handleDeleteLabel() {
        setIsSubmitting(true)
        await table.options.meta?.onRowAction?.("delete", row.original)
        if (shouldCloseDialogs) {
            closeDialogs()
        }
        setIsSubmitting(false)
    }

    async function handleCreateLabel(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("create", { ...row.original, ...values })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    async function handleSetViewFileLabel(labelId: string) {
        await table.options.meta?.onRowAction?.("set", { ...row.original, labelId })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    useEffect(() => {
        if (isMenuOpen) {
            closeDialogs(true)
        }
    }, [isMenuOpen])

    return (
        <>
            <ContextMenu /*open={isMenuOpen} onOpenChange={setIsMenuOpen}*/ >
                <ContextMenuTrigger asChild>
                    <AspectRatio className="bg-muted">
                        <Image
                            src={row.original.file?.resource ?? ""}
                            alt={row.original.file?.name ?? ""}
                            fill
                            className="h-full w-full rounded-md object-cover"
                        />
                    </AspectRatio>
                </ContextMenuTrigger>
                <ContextMenuContent /*align="end" className="w-[160px]"*/>
                    <ContextMenuItem onClick={openEditDialog}>Edit</ContextMenuItem>
                    <ContextMenuItem onClick={openDeleteDialog}>
                        Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Add to Label</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuItem onClick={openCreateLabelDialog}>
                                <Plus /> <span>Create Label</span>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            {items.map((item) => (
                                <ContextMenuItem key={item.id} onClick={() => handleSetViewFileLabel(item.id)}>
                                    <span>{item.name}</span>
                                    {row.original.labelId === item.id && <Check className="w-4 h-4 ml-auto" />}
                                </ContextMenuItem>
                            ))}
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuContent>
            </ContextMenu>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit label</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the label.
                        </DialogDescription>
                    </DialogHeader>
                    <LabelForm onSubmit={handleUpdateLabel} /*defaultValues={{ name: row.original.name, description: row.original.description }}*/ />
                </DialogContent>
            </Dialog>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete label</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this label? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteLabel} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isCreateLabelOpen} onOpenChange={setIsCreateLabelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Label</DialogTitle>
                        <DialogDescription>
                            Create a new collection to store your label.
                        </DialogDescription>
                    </DialogHeader>
                    <LabelForm onSubmit={handleCreateLabel} />
                </DialogContent>
            </Dialog>
        </>
    )
}