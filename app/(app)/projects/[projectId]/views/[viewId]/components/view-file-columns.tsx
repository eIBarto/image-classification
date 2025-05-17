"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { ViewFileRowOptions } from "./view-file-row-options";
import { GoldStandardSelection } from "./gold-standard-selection";
import { ViewFileRowImage } from "./view-file-row-image";

export const columns: Array<ColumnDef<Schema["ViewFileProxy1"]["type"]>> = [
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
            return a.original.file.name.localeCompare(b.original.file.name);
        },
    },
    {
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file, createdAt } = row.original;

            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <ViewFileRowImage row={row} projectId={row.original.view.projectId} />
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
                        <GoldStandardSelection row={row} table={table} />
                        <ViewFileRowOptions row={row} table={table} />
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