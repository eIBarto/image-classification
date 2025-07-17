"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: Array<ColumnDef<Schema["ClassificationProxy"]["type"]>> = [
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
        //id: "name",
        //header: () => null,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
            const { updatedAt, name, description, model, temperature, topP, maxLength } = row.original
            return (
                <Link className="flex flex-col gap-2 p-2 group" href={`classifications/${row.original.id}`}>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <p className="text-base">{name}</p>
                            {model && <Badge variant="outline" className="text-xs">{model}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                            {temperature != null && <Badge variant="outline">Temp: {temperature}</Badge>}
                            {topP != null && <Badge variant="outline">Top P: {topP}</Badge>}
                            {maxLength != null && <Badge variant="outline">Max: {maxLength}</Badge>}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                        <p className="text-sm text-muted-foreground">{description}</p>
                        <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={updatedAt}>
                            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                        </time>
                    </div>
                </Link>
            )
        },
        filterFn: (row, id, filterValue) => {
            return (row.original.name ?? "").toLowerCase().includes(filterValue.toLowerCase()) || (row.original.description ?? "").toLowerCase().includes(filterValue.toLowerCase())
        }
    },
]