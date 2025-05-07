"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
//import { DataTableColumnHeader } from "./data-table-column-header";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarNextImage } from "@/components/ui/avatar";
import { FileIcon } from "lucide-react";

export const columns: Array<ColumnDef<Schema["ProjectFileProxy"]["type"]>> = [
    {
        id: "data",
        //header: ({ column }) => (<DataTableColumnHeader column={column} title="Name" />),
        cell: ({ row }) => {
            const { file, createdAt } = row.original

            return (<div className="flex items-center gap-2">
                <Avatar className="rounded-sm">
                    {file?.resource && <AvatarNextImage src={file.resource} alt={file.name || ""} width={40} height={40} />}
                    <AvatarFallback className="rounded-sm">
                        <FileIcon className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <div className="ml-2">
                    <p className="max-w-[200px] truncate text-sm font-medium leading-none py-0.5">
                        {file.name}
                    </p>
                    <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>)
        },
        sortingFn: (rowA, rowB) => {
            const { file: fileA } = rowA.original
            const { file: fileB } = rowB.original

            return fileA.name.localeCompare(fileB.name)
        },
        filterFn: (row, _, filterValue) => {
            const { file } = row.original
            return file.name.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "createdAt",
        //enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "updatedAt",
        //enableHiding: false,
        enableSorting: true,
    },
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                className="mr-2"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                className="mr-2"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
]
