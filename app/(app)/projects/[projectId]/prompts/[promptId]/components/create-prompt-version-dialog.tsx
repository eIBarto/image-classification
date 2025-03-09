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
import { CreatePromptVersionFormSchema, CreatePromptVersionForm, CreatePromptVersionFormProps } from "./create-prompt-version-form"
export interface CreatePromptVersionDialogProps extends CreatePromptVersionFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreatePromptVersionDialog({ trigger, onSubmit, closeOnSuccess = true }: CreatePromptVersionDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreatePromptVersionFormSchema) => {
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
        <CreatePromptVersionForm onSubmit={handleSubmit}/>
      </DialogContent>
    </Dialog>
  )
}
