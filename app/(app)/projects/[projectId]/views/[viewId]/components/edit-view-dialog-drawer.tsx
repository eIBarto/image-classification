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
import { EditViewFormSchema, EditViewForm, EditViewFormProps } from "./edit-view-form"

export interface EditViewDialogDrawerProps extends EditViewFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function EditViewDialogDrawer({ trigger, onSubmit, closeOnSuccess = true }: EditViewDialogDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: EditViewFormSchema) => {
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
          <ResponsiveDialogDrawerTitle>Edit a view</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            This will edit a view.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        <EditViewForm onSubmit={handleSubmit} />
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}
