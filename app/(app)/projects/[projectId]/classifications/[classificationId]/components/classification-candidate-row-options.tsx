"use client"
/**
 * Row options for classification candidates: classify/delete actions
 */

import { Row, Table } from "@tanstack/react-table"
import type { Schema } from "@/amplify/data/resource"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { MoreHorizontal, Loader2 } from "lucide-react"

export interface ClassificationCandidateRowOptionsProps {
    table: Table<Schema["ClassificationCandidateProxy1"]["type"]>
    row: Row<Schema["ClassificationCandidateProxy1"]["type"]>
    shouldCloseDialogs?: boolean
}

export function ClassificationCandidateRowOptions({ row, table, shouldCloseDialogs = true }: ClassificationCandidateRowOptionsProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)

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
                        className="flex h-6 w-6 p-0 data-[state=open]:bg-muted data-[state=open]:text-black bg-black/20 text-white/70 ml-auto"
                    >
                        <MoreHorizontal />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => table.options.meta?.onRowAction?.("classify", row.original)}>
                        Classify
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={openDeleteDialog}>
                        Delete
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>

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

        </>
    )
}