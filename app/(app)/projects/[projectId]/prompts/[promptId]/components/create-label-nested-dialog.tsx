"use client"

import { useState } from "react"
import {
  NestedDialog,
  NestedDialogContent,
  NestedDialogDescription,
  NestedDialogHeader,
  NestedDialogTitle,
  NestedDialogTrigger
} from "@/components/ui/dialog"
import { CreateLabelFormSchema, CreateLabelForm, CreateLabelFormProps } from "./create-label-form"

export interface CreateLabelNestedDialogProps extends CreateLabelFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateLabelNestedDialog({ trigger, onSubmit, closeOnSuccess = true }: CreateLabelNestedDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateLabelFormSchema) => {
    await onSubmit?.(values)
    if (closeOnSuccess) {
      setOpen(false)
    }
  }

  return (
    <NestedDialog identifier="create-label" open={open} onOpenChange={setOpen}>
      <NestedDialogTrigger asChild>
        {trigger}
      </NestedDialogTrigger>
      <NestedDialogContent className="sm:max-w-[475px]">
        <NestedDialogHeader>
          <NestedDialogTitle>Create a label</NestedDialogTitle>
          <NestedDialogDescription>
            This will add a label to the project.
          </NestedDialogDescription>
        </NestedDialogHeader>
        <CreateLabelForm onSubmit={handleSubmit}/>
      </NestedDialogContent>
    </NestedDialog>
  )
}
