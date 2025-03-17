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
import { CreateClassificationFormSchema, CreateClassificationForm, CreateClassificationFormProps } from "./create-classification-form"

export interface CreateClassificationDialogProps extends CreateClassificationFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateClassificationDialog({ trigger, onSubmit, closeOnSuccess = true, projectId }: CreateClassificationDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateClassificationFormSchema) => {
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
          <DialogTitle>Create a prompt</DialogTitle>
          <DialogDescription>
            This will add a prompt to the project.
          </DialogDescription>
        </DialogHeader>
        <CreateClassificationForm onSubmit={handleSubmit} projectId={projectId} />
      </DialogContent>
    </Dialog>
  )
}
