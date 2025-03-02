"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableColumnHeader } from "./data-table-column-header";
//import bytes from "bytes";
import { ProjectFileTableRowActions } from "./project-file-table-row-actions";
import {
  Avatar,
  AvatarFallback,
  AvatarNextImage
} from "@/components/ui/avatar";
import { FileIcon } from "lucide-react";
export const columns: ColumnDef<Schema["ProjectFileProxy"]["type"]>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Name" />),
    cell: ({ row }) => {
      const { file } = row.original

      return (<div className="flex items-center gap-2">
        <Avatar className="rounded-sm">
          {file?.resource && <AvatarNextImage src={file.resource} alt={file.name || ""} width={40} height={40} />}
          <AvatarFallback className="rounded-sm">
            <FileIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{file.name}</span>
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
          <ProjectFileTableRowActions row={row} table={table} />
        </div>
      )
    },
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