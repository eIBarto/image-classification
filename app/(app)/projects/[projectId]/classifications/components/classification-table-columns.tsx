"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
//import { DataTableViewOptions } from "./data-table-prompt-options";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableViewOptions } from "./data-table-view-options";
import { ClassificationTableRowActions } from "./classification-table-row-actions";
//import { Badge } from "@/components/ui/badge";
//import bytes from "bytes";
//import { ClassificationTableRowActions } from "./project-file-table-row-actions";

export const columns: ColumnDef<Schema["ClassificationProxy"]["type"]>[] = [
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
  {
    accessorKey: "version",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Version" />),
    cell: ({ row }) => {
      const { version } = row.original

      return (
        <div className="text-sm font-medium">{version}</div>
      )
    },
  },
  {
    accessorKey: "view",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="View" />),
    cell: ({ row }) => {
      const { view } = row.original

      return (<div className="text-sm font-medium">{view?.name}</div>)
    },
    sortingFn: (a, b) => {
      const { view: viewA } = a.original
      const { view: viewB } = b.original

      if (!viewA || !viewB) {
        return 0
      }

      return viewA.name.localeCompare(viewB.name)
    },
    filterFn: (row, id, filterValue) => {
      const { view } = row.original

      if (!view) {
        return false
      }

      return view.name.toLowerCase().includes(filterValue.toLowerCase())
    },
  },
  /*{
    accessorKey: "labels",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Categories" />),
    cell: ({ row }) => {
      const { labels } = row.original

      if (!labels || labels.length < 1) {
        return null
      }

      return (
        <div className="space-x-1 flex">
          {labels.length > 2 ? (
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal"
            >
              {labels.length} selected
            </Badge>
          ) : (
            labels
              .map((label) => (
                <Badge
                  variant="secondary"
                  key={label.id}
                  className="rounded-sm px-1 font-normal"
                >
                  {label.name}
                </Badge>
              ))
          )}
        </div>
      )
    },
  },*/
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
          <ClassificationTableRowActions row={row} table={table} />
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