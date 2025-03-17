"use client"


import {
  Row,
  Table
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Trash2,
  EditIcon,
  Copy,
  Sparkles
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
//import { ProjectFileImage } from "./project-file-image"

interface ClassificationCandidateTableRowActionsProps {
  row: Row<Schema["ClassificationCandidateProxy1"]["type"]>
  table: Table<Schema["ClassificationCandidateProxy1"]["type"]>
}

export function ClassificationCandidateTableRowActions({
  row,
  table,
}: ClassificationCandidateTableRowActionsProps) {
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
              <span>View file</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={() => {
            table.options.meta?.onRowAction?.("classify", row.original)
          }}>
            <Sparkles className="text-muted-foreground" />
            <span>Classify</span>
          </DropdownMenuItem>
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
            <span>Delete from view</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View file</DialogTitle>
          <DialogDescription>
            View the file.
          </DialogDescription>
        </DialogHeader>
        {/*
<ProjectFileImage className="rounded-md" projectId={row.original.projectId} fileId={row.original.fileId} imageOptions={{ width: 1024, height: 1024, format: "webp" }} />*/}
      </DialogContent>
    </Dialog>
  )
}