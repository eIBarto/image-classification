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
import { CreatePromptFormSchema, CreatePromptForm, CreatePromptFormProps } from "./create-prompt-form"

export interface CreatePromptDialogProps extends CreatePromptFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreatePromptDialog({ trigger, onSubmit, closeOnSuccess = true }: CreatePromptDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreatePromptFormSchema) => {
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
        <CreatePromptForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
