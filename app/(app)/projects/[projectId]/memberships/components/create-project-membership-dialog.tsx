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
import { CreateProjectMembershipFormSchema, CreateProjectMembershipForm, CreateProjectMembershipFormProps } from "./create-project-membership-form"
export interface CreateProjectMembershipDialogProps extends CreateProjectMembershipFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateProjectMembershipDialog({ trigger, onSubmit, closeOnSuccess = true }: CreateProjectMembershipDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateProjectMembershipFormSchema) => {
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
          <DialogTitle>Create a membership</DialogTitle>
          <DialogDescription>
            This will add a user to the project.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectMembershipForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
