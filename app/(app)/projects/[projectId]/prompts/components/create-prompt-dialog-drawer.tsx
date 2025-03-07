"use client"

import { useState } from "react"
import {
  ResponsiveDialogDrawer,
  ResponsiveDialogDrawerContent,
  ResponsiveDialogDrawerDescription,
  ResponsiveDialogDrawerHeader,
  ResponsiveDialogDrawerTitle,
  ResponsiveDialogDrawerTrigger
} from "@/components/ui/responsive-dialog-drawer"
import { CreatePromptFormSchema, CreatePromptForm, CreatePromptFormProps } from "./create-prompt-form"

export interface CreatePromptDialogDrawerProps extends CreatePromptFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreatePromptDialogDrawer({ trigger, onSubmit, closeOnSuccess = true }: CreatePromptDialogDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreatePromptFormSchema) => {
    await onSubmit?.(values)
    if (closeOnSuccess) {
      setOpen(false)
    }
  }

  return (
    <ResponsiveDialogDrawer open={open} onOpenChange={setOpen}>
      <ResponsiveDialogDrawerTrigger asChild>
        {trigger}
      </ResponsiveDialogDrawerTrigger>
      <ResponsiveDialogDrawerContent className="sm:max-w-[475px]">
        <ResponsiveDialogDrawerHeader>
          <ResponsiveDialogDrawerTitle>Create a prompt</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            This will add a prompt to the project.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        <CreatePromptForm onSubmit={handleSubmit} />
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}
