"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
//import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableViewOptions } from "./data-table-view-options";
import { ViewTableRowActions } from "./view-table-row-actions";
//import bytes from "bytes";
//import { ViewTableRowActions } from "./project-file-table-row-actions";

export const columns: ColumnDef<Schema["ViewProxy"]["type"]>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Name" />),
    cell: ({ row }) => {
      const { name } = row.original

      return (
        <div className="text-sm font-medium">{name}</div>
      )
    },
  },
  /*{
    accessorKey: "size",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Size" />),
    cell: ({ row }) => {
      const { file } = row.original


      return (<div>{bytes(file.size, { decimalPlaces: 2, unitSeparator: " " })}</div>)
    },
  },*/
  {
    accessorKey: "createdAt",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Created" />),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string

      return (<div className="font-medium">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div>)
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Updated" />),
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as string

      return (<div className="font-medium">{formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</div>)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: ({ table }) => (<DataTableViewOptions table={table} />),
    cell: ({ row, table }) => {
      return (
        <div className="flex justify-end">
          <ViewTableRowActions row={row} table={table} />
        </div>
      )
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        //className="mr-2"
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
        //className="mr-2"
        //className="translate-y-[2px]"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]