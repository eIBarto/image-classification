"use client"

import { Row, Table } from "@tanstack/react-table"
import type { Schema } from "@/amplify/data/resource"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSubTrigger, DropdownMenuSub, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LabelForm, LabelFormSchema } from "./label-form"
import { MoreHorizontal, Loader2, Plus } from "lucide-react"

export interface ClassificationCandidateRowOptionsProps {
    table: Table<Schema["ClassificationCandidateProxy1"]["type"]>
    row: Row<Schema["ClassificationCandidateProxy1"]["type"]>
    shouldCloseDialogs?: boolean
}

export function ClassificationCandidateRowOptions({ row, table, shouldCloseDialogs = true }: ClassificationCandidateRowOptionsProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false)

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function openEditDialog() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)
        setIsEditOpen(false)
        setIsCreateCollectionOpen(false)
    }

    async function handleUpdateLabel(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("update", { ...row.original, ...values })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    async function handleCreateCollection(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("create", { ...row.original, ...values })
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

    function openCreateCollectionDialog() {
        setIsMenuOpen(false)
        setIsCreateCollectionOpen(true)
    }

    useEffect(() => {
        if (isMenuOpen) {
            closeDialogs(true)
        }
    }, [isMenuOpen])

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-6 w-6 p-0 data-[state=open]:bg-muted data-[state=open]:text-black bg-black/20 text-white/70"
                    >
                        <MoreHorizontal />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => table.options.meta?.onRowAction?.("classify", row.original)}>
                        Classify
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openEditDialog}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={openDeleteDialog}>
                        Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Add to Collection</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                            <DropdownMenuItem onClick={openCreateCollectionDialog}>
                                <Plus /> <span>Create Label</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit label</DialogTitle>
                        <DialogDescription>
                            Edit the name and description of the label.
                        </DialogDescription>
                    </DialogHeader>
                    <LabelForm onSubmit={handleUpdateLabel} /*defaultValues={{ name: row.original.name, description: row.original.description }} */ />
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