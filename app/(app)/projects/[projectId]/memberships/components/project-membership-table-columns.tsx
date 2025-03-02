"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableViewOptions } from "./data-table-view-options";

type AccessRole = {
  value: string
  label: string
}

const accessRoles: Array<AccessRole> = [
  {
    value: "VIEW",
    label: "View",
  },
  {
    value: "MANAGE",
    label: "Manage",
  },
]

export const columns: ColumnDef<Schema["ProjectMembershipProxy"]["type"]>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
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
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Email" />),
    cell: ({ row }) => {
      const { user } = row.original

      return (<span className="lowercase">{user.email}</span>)
    },
    sortingFn: (rowA, rowB) => {
      const { user: userA } = rowA.original
      const { user: userB } = rowB.original

      if (!userA?.email || !userB?.email) {
        return 0
      }

      return userA.email.localeCompare(userB.email)
    },
    filterFn: (row, columnId, filterValue) => {
      const { user } = row.original
      if (!user?.email) {
        return false
      }
      return user.email.toLowerCase().includes(filterValue.toLowerCase())
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Created" />),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string

      return (<div className="font-medium">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div>)
    },
  },
  {
    accessorKey: "access",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Access" />),
    cell: ({ row, table }) => {
      const { access } = row.original

      return (<Select defaultValue={access} onValueChange={(value: Schema["AccessProxy"]["type"]) => {
        table.options.meta?.onRowAction?.("update", { ...row.original, access: value })
        console.log(value)
      }}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {accessRoles.map((role) => (
            <SelectItem
              key={role.value}
              value={role.value}
            >
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: ({ table }) => (<DataTableViewOptions table={table} />),
    cell: ({ row, table }) => {
      return (
        <Button className="flex ml-auto" variant="ghost" size="icon" onClick={() => {
          table.options.meta?.onRowAction?.("delete", row.original)
        }}>
          <Trash2 className="text-muted-foreground" />
        </Button>
      )
    },
  },
]
