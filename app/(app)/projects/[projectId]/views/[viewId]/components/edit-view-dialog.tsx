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
import { EditViewFormSchema, EditViewForm, EditViewFormProps } from "./edit-view-form"

export interface EditViewDialogProps extends EditViewFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function EditViewDialog({ trigger, onSubmit, closeOnSuccess = true }: EditViewDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: EditViewFormSchema) => {
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
          <DialogTitle>Edit a view</DialogTitle>
          <DialogDescription>
            This will edit a view.
          </DialogDescription>
        </DialogHeader>
        <EditViewForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
