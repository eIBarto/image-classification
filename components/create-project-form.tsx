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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  description: z.string().optional(),
});

export type CreateProjectFormSchema = z.infer<typeof formSchema>;

export interface CreateProjectFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: CreateProjectFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function CreateProjectForm({ className, onSubmit, resetOnSuccess = true, ...props }: CreateProjectFormProps) {
  const form = useForm<CreateProjectFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreateProjectFormSchema) => {
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
                <Input type="text" placeholder="Project Name" {...field} disabled={disabled || isSubmitting} />
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
                  placeholder="Project Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Project Description
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Create Project"}
        </Button>
      </form>
    </Form>
  )
}