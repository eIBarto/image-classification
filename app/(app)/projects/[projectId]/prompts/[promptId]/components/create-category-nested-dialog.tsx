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
import { CreateCategoryFormSchema, CreateCategoryForm, CreateCategoryFormProps } from "./create-category-form"

export interface CreateCategoryNestedDialogProps extends CreateCategoryFormProps {
  closeOnSuccess?: boolean
  trigger: React.ReactNode
}

export function CreateCategoryNestedDialog({ trigger, onSubmit, closeOnSuccess = true }: CreateCategoryNestedDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (values: CreateCategoryFormSchema) => {
    await onSubmit?.(values)
    if (closeOnSuccess) {
      setOpen(false)
    }
  }

  return (
    <NestedDialog identifier="create-category" open={open} onOpenChange={setOpen}>
      <NestedDialogTrigger asChild>
        {trigger}
      </NestedDialogTrigger>
      <NestedDialogContent className="sm:max-w-[475px]">
        <NestedDialogHeader>
          <NestedDialogTitle>Create a category</NestedDialogTitle>
          <NestedDialogDescription>
            This will add a category to the project.
          </NestedDialogDescription>
        </NestedDialogHeader>
        <CreateCategoryForm onSubmit={handleSubmit}/>
      </NestedDialogContent>
    </NestedDialog>
  )
}
