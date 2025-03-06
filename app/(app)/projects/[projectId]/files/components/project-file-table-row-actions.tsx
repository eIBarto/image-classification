"use client"


import {
  Row,
  Table
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Trash2,
  EditIcon,
  Copy
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
import { UpdateFileForm } from "./update-file-form"
import { ProjectFileImage } from "./project-file-image"

interface ProjectFileTableRowActionsProps {
  row: Row<Schema["ProjectFileProxy"]["type"]>
  table: Table<Schema["ProjectFileProxy"]["type"]>
}

export function ProjectFileTableRowActions({
  row,
  table,
}: ProjectFileTableRowActionsProps) {
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
              <span>Edit file</span>
            </DropdownMenuItem>
          </ResponsiveDialogDrawerTrigger>
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("copy", row.original)
          }}>
            <Copy className="text-muted-foreground" />
            <span>Copy name</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("delete", row.original)
          }}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete file</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResponsiveDialogDrawerContent>
        <ResponsiveDialogDrawerHeader>
          <ResponsiveDialogDrawerTitle>Edit file</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            Edit the name of the file.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        <ProjectFileImage className="rounded-md" projectId={row.original.projectId} fileId={row.original.fileId} imageOptions={{ width: 1024, height: 1024, format: "webp" }} />
        <UpdateFileForm onSubmit={async ({ name }) => {
          const { file, ...rest } = row.original
          await table.options.meta?.onRowAction?.("update", { ...rest, file: { ...file, name } })
        }} />
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}