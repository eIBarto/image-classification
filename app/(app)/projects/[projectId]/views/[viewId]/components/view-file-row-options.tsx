"use client"

import { Row, Table } from "@tanstack/react-table"
import type { Schema } from "@/amplify/data/resource"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, /*DropdownMenuSubTrigger, DropdownMenuSub, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuTrigger */ } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
//import { Check } from "lucide-react"

import { LabelForm, LabelFormSchema } from "./label-form"
import { MoreHorizontal, Loader2 } from "lucide-react"
//import { useInfiniteQuery } from "@tanstack/react-query"
//import { toast } from "sonner"
//import { generateClient } from 'aws-amplify/data';

/*
const client = generateClient<Schema>();

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
*/
export interface ViewFileRowOptionsProps {
    table: Table<Schema["ViewFileProxy1"]["type"]>
    row: Row<Schema["ViewFileProxy1"]["type"]>
    shouldCloseDialogs?: boolean
    /*viewId: string
    projectId: string*/
}

export function ViewFileRowOptions({ row, table, shouldCloseDialogs = true/*, viewId, projectId */ }: ViewFileRowOptionsProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false)

    

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
        setIsCreateLabelOpen(false)
    }

    async function handleUpdateLabel(values: LabelFormSchema) {
        await table.options.meta?.onRowAction?.("update", { ...row.original, ...values })
        if (shouldCloseDialogs) {
            closeDialogs()
        }
    }

    async function handleCreateLabel(values: LabelFormSchema) {
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
                    <DropdownMenuItem onClick={openEditDialog}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={openDeleteDialog}>
                        Delete
                    </DropdownMenuItem>
                    {/*<DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Gold Standard Label</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                            <DropdownMenuItem onClick={openCreateLabelDialog}>
                                <Plus /> <span>Create Label</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {items.map((item) => (
                                <DropdownMenuItem key={item.id} onClick={() => handleSetViewFileLabel(item.id)}>
                                    <span>{item.name}</span>
                                    {row.original.labelId === item.id && <Check className="w-4 h-4 ml-auto" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>*/}
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