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
import { CreateProjectMembershipFormSchema, CreateProjectMembershipForm, CreateProjectMembershipFormProps } from "./create-project-membership-form"
export interface CreateProjectMembershipDialogDrawerProps extends CreateProjectMembershipFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateProjectMembershipDialogDrawer({ trigger, onSubmit, closeOnSuccess = true }: CreateProjectMembershipDialogDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateProjectMembershipFormSchema) => {
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
          <ResponsiveDialogDrawerTitle>Create a membership</ResponsiveDialogDrawerTitle>
          <ResponsiveDialogDrawerDescription>
            This will add a user to the project.
          </ResponsiveDialogDrawerDescription>
        </ResponsiveDialogDrawerHeader>
        <CreateProjectMembershipForm onSubmit={handleSubmit} />
      </ResponsiveDialogDrawerContent>
    </ResponsiveDialogDrawer>
  )
}
