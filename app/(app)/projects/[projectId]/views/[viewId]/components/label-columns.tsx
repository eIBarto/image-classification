"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { LabelRowActions } from "./label-row-actions";

export const columns: Array<ColumnDef<Schema["LabelProxy2"]["type"]>> = [
  {
    accessorKey: "createdAt",
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: "updatedAt",

    enableSorting: true,
  },
  {
    id: "data",

    enableHiding: false,
    enableSorting: false,
    cell: ({ row, table }) => {
      const { name, description, createdAt } = row.original
      return (
        <div className="flex flex-col items-start gap-2 p-2 text-left text-sm">
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{name}</div>

              </div>
              <div
                className="ml-auto text-xs"

              >
                <LabelRowActions row={row} table={table} />
              </div>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={createdAt}>
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
              })}
            </time>
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {description.substring(0, 300)}
          </div>

        </div >
      )
    },
    filterFn: (row, id, filterValue) => {
      return row.original.name.toLowerCase().includes(filterValue.toLowerCase()) || row.original.description.toLowerCase().includes(filterValue.toLowerCase())
    }
  },
]