"use client"

import { Row, Table } from "@tanstack/react-table"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"
import { ProjectImage } from "../views/[viewId]/components/project-image"

export interface ProjectFileRowActionsProps {
    table: Table<Schema["ProjectFileProxy"]["type"]>
    row: Row<Schema["ProjectFileProxy"]["type"]>
    shouldCloseDialogs?: boolean
    projectId: string
}

export function ProjectFileRowActions({ row, table, shouldCloseDialogs = true, projectId }: ProjectFileRowActionsProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function openDeleteDialog() {
        setIsMenuOpen(false)
        setIsDeleteOpen(true)
    }

    function openDetailDialog() {
        setIsMenuOpen(false)
        setIsDetailDialogOpen(true)
    }

    function closeDialogs(ignoreMenu: boolean = false) {
        if (!ignoreMenu) {
            setIsMenuOpen(false)
        }
        setIsDeleteOpen(false)
        setIsDetailDialogOpen(false)
    }

    async function handleDeleteFile() {
        setIsSubmitting(true)
        try {
            await table.options.meta?.onRowAction?.("delete", row.original)
            if (shouldCloseDialogs) {
                closeDialogs()
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete file")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (isMenuOpen) {
            closeDialogs(true)
        }
    }, [isMenuOpen])

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <AspectRatio className="bg-muted">
                        <Image
                            sizes="auto"
                            onClick={openDetailDialog}
                            src={row.original.file?.resource ?? ""}
                            alt={row.original.file?.name ?? ""}
                            fill
                            className="h-full w-full rounded-md object-cover cursor-pointer"
                        />
                    </AspectRatio>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={openDeleteDialog}>
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete file</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this file? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteFile} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="max-w-[400px] truncate">{row.original.file?.name}</DialogTitle>
                    </DialogHeader>
                    <ProjectImage projectId={projectId} fileId={row.original.fileId} className="rounded-md overflow-hidden" />
                </DialogContent>
            </Dialog>
        </>
    )
} 