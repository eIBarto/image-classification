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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface PromptTableRowActionsProps {
  row: Row<Schema["PromptProxy"]["type"]>
  table: Table<Schema["PromptProxy"]["type"]>
}

export function PromptTableRowActions({
  row,
  table,
}: PromptTableRowActionsProps) {
  return (
    <Dialog>
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
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <EditIcon />
              <span>Edit prompt</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("delete", row.original)
          }}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete prompt</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("view", row.original)
          }}>
            <Link className="text-muted-foreground" />
            <span>View versions</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit prompt</DialogTitle>
          <DialogDescription>
            Edit the name and description of the prompt.
          </DialogDescription>
        </DialogHeader>
        {/*<UpdateFileForm onSubmit={async ({ name }) => {
          const { file, ...rest } = row.original
          await table.options.meta?.onRowAction?.("update", { ...rest, file: { ...file, name } })
        }} />*/}
      </DialogContent>
    </Dialog>
  )
}