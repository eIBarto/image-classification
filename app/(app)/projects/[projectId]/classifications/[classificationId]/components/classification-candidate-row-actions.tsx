/**
 * Row actions for classification candidates
 * - Context menu to classify, edit, delete, and add to collection
 * - Uses dialogs; keep transitions and submit states responsive
 */
import { Row, Table } from "@tanstack/react-table"
import type { Schema } from "@/amplify/data/resource"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuSub, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LabelForm, LabelFormSchema } from "./label-form"
import { Loader2, Plus } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"

export interface ClassificationCandidateRowActionsProps {
    table: Table<Schema["ClassificationCandidateProxy1"]["type"]>
    row: Row<Schema["ClassificationCandidateProxy1"]["type"]>
    shouldCloseDialogs?: boolean
}

/**
 * Action menu and dialogs bound to a candidate row
 */
export function ClassificationCandidateRowActions({ row, table, shouldCloseDialogs = true }: ClassificationCandidateRowActionsProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function openEditDialog() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function openCreateCollectionDialog() {
        setIsMenuOpen(false)
        setIsCreateCollectionOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)
        setIsEditOpen(false)
        setIsCreateCollectionOpen(false)
    }

    // Persist label updates then optionally close dialogs
    async function handleUpdateLabel(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("update", { ...row.original, ...values })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    // Delete label with minimal UI blocking
    async function handleDeleteLabel() {
        setIsSubmitting(true)
        await table.options.meta?.onRowAction?.("delete", row.original)
        if (shouldCloseDialogs) {
            closeDialogs()
        }
        setIsSubmitting(false)
    }

    // Create new collection/label scoped to the row item
    async function handleCreateCollection(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("create", { ...row.original, ...values })
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
            <ContextMenu  >
                <ContextMenuTrigger asChild>
                    <AspectRatio className="bg-muted">
                        <Image
                            sizes="auto"
                            src={row.original.file?.resource ?? ""}
                            alt={row.original.file?.name ?? ""}
                            fill
                            className="h-full w-full rounded-md object-cover"
                        />
                    </AspectRatio>
                </ContextMenuTrigger>
                <ContextMenuContent >
                    <ContextMenuItem onClick={() => table.options.meta?.onRowAction?.("classify", row.original)}>
                        Classify
                    </ContextMenuItem>
                    <ContextMenuItem onClick={openEditDialog}>Edit</ContextMenuItem>
                    <ContextMenuItem onClick={openDeleteDialog}>
                        Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Add to Collection</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuItem onClick={openCreateCollectionDialog}>
                                <Plus /> <span>Create Label</span>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
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
                    <LabelForm onSubmit={handleUpdateLabel}  />
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
            <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Collection</DialogTitle>
                        <DialogDescription>
                            Create a new collection to store your label.
                        </DialogDescription>
                    </DialogHeader>
                    <LabelForm onSubmit={handleCreateCollection} />
                </DialogContent>
            </Dialog>
        </>
    )
}