"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { Check } from "lucide-react";

export const columns: Array<ColumnDef<Schema["LabelProxy6"]["type"]>> = [
    {
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
            const { name } = row.original
            return (
                <div className="flex items-center gap-2">
                    <span>{name}</span>
                    {row.getIsSelected() && <Check className="h-2 w-2 ml-auto" />}
                </div>
            )
        },
        filterFn: (row, id, filterValue) => {
            return (row.original.name ?? "").toLowerCase().includes(filterValue.toLowerCase())
        },

    },
]