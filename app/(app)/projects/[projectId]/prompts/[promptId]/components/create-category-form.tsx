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
//import { ManagedUserCommandList } from "./managed-user-command-list"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export type CreateCategoryFormSchema = z.infer<typeof formSchema>;

export interface CreateCategoryFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: CreateCategoryFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
  defaultValues?: Partial<CreateCategoryFormSchema>
}

export function CreateCategoryForm({ 
  className, 
  onSubmit, 
  resetOnSuccess = true, 
  defaultValues,
  ...props 
}: CreateCategoryFormProps) {
  const form = useForm<CreateCategoryFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreateCategoryFormSchema) => {
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
                <Input type="text" placeholder="Text" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Category Name
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="View Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Category Description
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Continue"}
        </Button>
      </form>
    </Form>
  )
}