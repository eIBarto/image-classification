"use client"
/**
 * Column definitions for classification candidates table
 * - Custom cell renders image preview and current result label badge
 */

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";

import { Clock } from "lucide-react";

import { ClassificationCandidateRowOptions } from "./classification-candidate-row-options";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const columns: Array<ColumnDef<Schema["ClassificationCandidateProxy1"]["type"]>> = [
    {
        accessorKey: "createdAt",
        enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "updatedAt",
        enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "name",
        enableHiding: false,
        enableSorting: true,
        sortingFn: (a, b) => {
            const aName = a.original.file?.name ?? "";
            const bName = b.original.file?.name ?? "";
            return aName.localeCompare(bName);
        },
    },
    {
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file, result } = row.original;
            const { createdAt, } = file

            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <AspectRatio className="bg-muted">
                        <Image
                            sizes="auto"
                            src={row.original.file?.resource ?? ""}
                            alt={row.original.file?.name ?? ""}
                            fill
                            className="h-full w-full rounded-md object-cover"
                        />
                    </AspectRatio>
                    <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-sm font-semibold text-white">{file?.name}</h2>
                        <div className="flex items-end gap-2 mb-2 justify-between">
                            <div className="flex items-center text-white/70 text-sm gap-1">
                                <time dateTime={createdAt} className="text-[10px] whitespace-nowrap">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</time>
                                <Clock className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 left-0 flex gap-2 justify-between p-2">

                        {result && <Badge
                            className="w-auto h-auto text-[10px] px-1.5 py-0.5 bg-black/20 text-white/70 border-0 justify-between"
                        >
                            {result?.label?.name}
                        </Badge>}
                        <ClassificationCandidateRowOptions row={row} table={table} />
                    </div>
                </div>
            )
        },
        filterFn: (row, id, filterValue) => {
            const { file } = row.original;
            return file?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false;
        },
    },
]