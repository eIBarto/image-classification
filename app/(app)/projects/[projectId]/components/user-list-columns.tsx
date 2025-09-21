"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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
    accessorKey: "email",
    enableHiding: false,
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
    accessorKey: "access",
    header: ({ column }) => (<DataTableColumnHeader column={column} title="Access" />),
    cell: ({ row, table }) => {
      const { access } = row.original

      return (<Select defaultValue={access} onValueChange={(value: Schema["AccessProxy"]["type"]) => {
        table.options.meta?.onRowAction?.("update", { ...row.original, access: value })
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
]