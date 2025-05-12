"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { ViewFileRowActions } from "./view-file-row-actions";
import { ViewFileRowOptions } from "./view-file-row-options";

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
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file } = row.original;

            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <ViewFileRowActions 
                        row={row} 
                        table={table} 
                        projectId={row.original.view.projectId} 
                        viewId={row.original.viewId} 
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-sm font-semibold text-white">{file?.name}</h2>
                        <div className="flex items-center gap-2 mb-2 justify-between">
                            {/*result && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-4 bg-black/20 text-white/70 border-0">{result.label?.name}</Badge>}*/}
                            {file && <div className="flex items-center text-white/70 text-sm gap-1">
                                <span className="text-[10px]">{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                                <Clock className="w-3 h-3" />
                            </div>}
                        </div>
                    </div>
                    <div className="absolute top-2 right-2">
                        <ViewFileRowOptions row={row} table={table} viewId={row.original.viewId} projectId={row.original.view.projectId} />
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