"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { ProjectFileRowActions } from "./project-file-row-actions";
import { ProjectFileRowOptions } from "./project-file-row-options";

export const columns: Array<ColumnDef<Schema["ProjectFileProxy"]["type"]>> = [
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
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file, updatedAt } = row.original;
            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <ProjectFileRowActions row={row} table={table} projectId={row.original.projectId} />
                    <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-sm font-semibold text-white">{file?.name}</h2>
                        <div className="flex items-center gap-2 mb-2 justify-between">
                            <div className="flex items-center text-white/70 text-sm gap-1">
                                <Clock className="w-3 h-3" />
                                <time className="text-[10px]" dateTime={updatedAt}>
                                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: false })}
                                </time>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-2 right-2">
                        <ProjectFileRowOptions row={row} table={table} />
                    </div>
                </div>
            )
        },
        filterFn: (row, _, filterValue) => {
            const { file } = row.original;
            return file?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false;
        }
    },
]