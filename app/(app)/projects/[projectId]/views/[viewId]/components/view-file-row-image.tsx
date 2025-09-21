"use client"
/**
 * Thumbnail with modal preview for a view file
 */

import { Row } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProjectImage } from "./project-image"
import Image from "next/image"
import type { Schema } from '@/amplify/data/resource';
import { AspectRatio } from "@/components/ui/aspect-ratio"

export interface ViewFileRowImageProps {
    row: Row<Schema["ViewFileProxy1"]["type"]>
    projectId: string
}

export function ViewFileRowImage({ row, projectId }: ViewFileRowImageProps) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <AspectRatio className="bg-muted">
                    <Image
                        sizes="auto"
                        src={row.original.file?.resource ?? ""}
                        alt={row.original.file?.name ?? ""}
                        fill
                        className="h-full w-full rounded-md object-cover"
                    />
                </AspectRatio>
            </DialogTrigger>
            <DialogContent className="space-y-4">
                <DialogHeader>
                    <DialogTitle className="max-w-[400px] truncate">{row.original.file?.name}</DialogTitle>

                </DialogHeader>
                <ProjectImage projectId={projectId} fileId={row.original.fileId} className="rounded-md overflow-hidden" />
            </DialogContent>
        </Dialog>
    )
}