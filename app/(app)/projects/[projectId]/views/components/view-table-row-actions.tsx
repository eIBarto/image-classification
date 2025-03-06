"use client"


import {
  Row,
  Table
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Trash2,
  EditIcon,
  Link
} from "lucide-react"
import {
  ResponsiveDialogDrawer,
  ResponsiveDialogDrawerContent,
  ResponsiveDialogDrawerDescription,
  ResponsiveDialogDrawerHeader,
  ResponsiveDialogDrawerTitle,
  ResponsiveDialogDrawerTrigger,
} from "@/components/ui/responsive-dialog-drawer"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Schema } from "@/amplify/data/resource"
//import { UpdateFileForm } from "./update-file-form"

interface ViewTableRowActionsProps {
  row: Row<Schema["ViewProxy"]["type"]>
  table: Table<Schema["ViewProxy"]["type"]>
}

export function ViewTableRowActions({
  row,
  table,
}: ViewTableRowActionsProps) {
  return (
    <ResponsiveDialogDrawer>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <ResponsiveDialogDrawerTrigger asChild>
            <DropdownMenuItem>
              <EditIcon />
              <span>Edit view</span>
            </DropdownMenuItem>
          </ResponsiveDialogDrawerTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("delete", row.original)
          }}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete view</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("view", row.original)
          }}>
            <Link className="text-muted-foreground" />
            <span>View files</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResponsiveDialogDrawerContent>
        <ResponsiveDialogDrawerHeader>
          <ResponsiveDialogDrawerTitle>Edit view</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            Edit the name and description of the view.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        {/*<UpdateFileForm onSubmit={async ({ name }) => {
          const { file, ...rest } = row.original
          await table.options.meta?.onRowAction?.("update", { ...rest, file: { ...file, name } })
        }} />*/}
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}