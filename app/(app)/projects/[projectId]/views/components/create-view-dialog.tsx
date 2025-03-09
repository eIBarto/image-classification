"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { CreateViewFormSchema, CreateViewForm, CreateViewFormProps } from "./create-view-form"

export interface CreateViewDialogProps extends CreateViewFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateViewDialog({ trigger, onSubmit, closeOnSuccess = true, projectId }: CreateViewDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateViewFormSchema) => {
    await onSubmit?.(values)
    if (closeOnSuccess) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Create a view</DialogTitle>
          <DialogDescription>
            This will add a view to the project.
          </DialogDescription>
        </DialogHeader>
        <CreateViewForm onSubmit={handleSubmit} projectId={projectId} />
      </DialogContent>
    </Dialog>
  )
}
