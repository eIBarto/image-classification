"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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
            const {  updatedAt, name, description } = row.original
            return (
                <Link className="flex flex-col gap-2 p-2 group" href={`classifications/${row.original.id}`}>
                    <p className="text-base">{name}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{description}</p>
                        <div className="flex items-center gap-2 ml-auto">
                            <time className="text-xs text-muted-foreground" dateTime={updatedAt}>
                                {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                            </time>
                        </div>
                    </div>
                </Link>
            )
        },
        filterFn: (row, id, filterValue) => {
            return (row.original.name ?? "").toLowerCase().includes(filterValue.toLowerCase()) || (row.original.description ?? "").toLowerCase().includes(filterValue.toLowerCase())
        }
    },
]