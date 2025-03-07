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
import { CreatePromptVersionFormSchema, CreatePromptVersionForm, CreatePromptVersionFormProps } from "./create-prompt-version-form"

export interface CreatePromptVersionDialogDrawerProps extends CreatePromptVersionFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreatePromptVersionDialogDrawer({ trigger, onSubmit, closeOnSuccess = true }: CreatePromptVersionDialogDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreatePromptVersionFormSchema) => {
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
        <CreatePromptVersionForm onSubmit={handleSubmit}/>
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}
