"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PromptVersionRowActions } from "./prompt-version-row-actions";

export const columns: Array<ColumnDef<Schema["PromptVersionProxy1"]["type"]>> = [
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
    accessorKey: "version",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      return <span className="text-xs">{row.original.version}</span>
    }
  },
  {
    id: "data",
    //id: "name",
    //header: () => null,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const { version, text, updatedAt, labels } = row.original
      return (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version: {version.slice(0, 8)}</span>

            <PromptVersionRowActions row={row} table={table} />
          </div>
          <p className="text-base">{text}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {labels?.map((label) => (
                <Badge key={label.id} variant="outline">
                  {label.name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {/*<Button variant="secondary" className="w-6 h-6" size="icon">
                <Pencil />
                <span className="sr-only">Edit</span>
              </Button>*/}
              <time className="text-xs text-muted-foreground" dateTime={updatedAt}>
                {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
      )
    },
    filterFn: (row, id, filterValue) => {
      return row.original.text.toLowerCase().includes(filterValue.toLowerCase()) || row.original.version.toLowerCase().includes(filterValue.toLowerCase()) || (row.original.labels ?? []).some((label) => label.name.toLowerCase().includes(filterValue.toLowerCase()) || label.description.toLowerCase().includes(filterValue.toLowerCase()))
    }
  },
]