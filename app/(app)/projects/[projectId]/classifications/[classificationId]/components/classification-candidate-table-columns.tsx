"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableColumnHeader } from "./data-table-column-header";
//import bytes from "bytes";
import { ClassificationCandidateTableRowActions } from "./classification-candidate-row-actions";
import {
  Avatar,
  AvatarFallback,
  AvatarNextImage
} from "@/components/ui/avatar";
import { FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const columns: ColumnDef<Schema["ClassificationCandidateProxy1"]["type"]>[] = [
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
      const { createdAt } = row.original.file

      return (<div className="font-medium">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div>)
    },
    sortingFn: (rowA, rowB) => {
      const { createdAt: createdAtA } = rowA.original.file
      const { createdAt: createdAtB } = rowB.original.file

      return new Date(createdAtA).getTime() - new Date(createdAtB).getTime()
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Updated" />),
    cell: ({ row }) => {
      const { updatedAt } = row.original.file

      return (<div className="font-medium">{formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</div>)
    },
    sortingFn: (rowA, rowB) => {
      const { updatedAt: updatedAtA } = rowA.original.file
      const { updatedAt: updatedAtB } = rowB.original.file

      return new Date(updatedAtA).getTime() - new Date(updatedAtB).getTime()
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Status" />),
    cell: ({ row }) => {
      const status = row.original.status

      return (
        <Badge variant={status === "PENDING" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "result",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Result" />),
    cell: ({ row }) => {
      const { result } = row.original

      if (!result) return null

      const { label, confidence } = result
      
      const confidencePercent = Math.round(confidence * 100)
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col w-full">
            <span className="font-medium">{label.name}</span>
            <Progress 
              value={confidencePercent} 
              className="h-1.5 mt-1 w-[100px]"
            />
            <span className="text-xs text-muted-foreground mt-0.5">
              {confidencePercent}% confidence
            </span>
          </div>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const { result: resultA } = rowA.original
      const { result: resultB } = rowB.original

      if (!resultA || !resultB) return 0

      return resultB.confidence - resultA.confidence
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: ({ table }) => (<DataTableViewOptions table={table} />),
    cell: ({ row, table }) => {
      return (
        <div className="flex justify-end">
          <ClassificationCandidateTableRowActions row={row} table={table} />
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