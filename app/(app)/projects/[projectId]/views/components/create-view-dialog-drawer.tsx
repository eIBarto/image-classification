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
import { CreateViewFormSchema, CreateViewForm, CreateViewFormProps } from "./create-view-form"

export interface CreateViewDialogDrawerProps extends CreateViewFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateViewDialogDrawer({ trigger, onSubmit, closeOnSuccess = true, projectId }: CreateViewDialogDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateViewFormSchema) => {
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
          <ResponsiveDialogDrawerTitle>Create a view</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            This will add a view to the project.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        <CreateViewForm onSubmit={handleSubmit} projectId={projectId} />
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}
