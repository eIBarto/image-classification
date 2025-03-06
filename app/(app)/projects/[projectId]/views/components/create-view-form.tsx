"use client"

import { cn } from "@/lib/utils"

import { Loader2 } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ProjectFileTable } from "./project-file-table"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
//import { ManagedUserCommandList } from "./managed-user-command-list"

const formSchema = z.object({
  files: z.array(z.string()).min(1, "At least one file must be selected"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateViewFormSchema = z.infer<typeof formSchema>;

export interface CreateViewFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  projectId: string
  onSubmit?: (values: CreateViewFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function CreateViewForm({ className, onSubmit, resetOnSuccess = true, projectId, ...props }: CreateViewFormProps) {
  const form = useForm<CreateViewFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      name: "",
      description: "",
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreateViewFormSchema) => {
    try {
      const result = await onSubmit?.(values)
      if (result) {
        throw new Error(result)
      }
      if (resetOnSuccess) {
        form.reset()
      }
    } catch (error) {
      console.error(error)
      form.setError("root", { message: error instanceof Error ? error.message : "An error occurred" })
    }
  })
  
  const handleUserSelect = useCallback((files: string[]) => {
      form.setValue("files", files)
    },
    [form]
  )


  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <FormField
          control={form.control}
          name="name"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="View Name" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="View Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                View Description
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Files</FormLabel>
              <FormControl>
                <ProjectFileTable isMulti projectId={projectId} onSelect={handleUserSelect} value={field.value} /*disabled={disabled || isSubmitting}*/ />
              </FormControl>
              <FormDescription>
                All available files
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Create View"}
        </Button>
      </form>
    </Form>
  )
}