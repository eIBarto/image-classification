"use client"
/**
 * Edit classification metadata
 */

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
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

export type ClassificationFormSchema = z.infer<typeof formSchema>;

export interface ClassificationFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: ClassificationFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
  defaultValues?: Partial<ClassificationFormSchema>
}

export function ClassificationForm({
  className,
  onSubmit,
  resetOnSuccess = true,
  defaultValues = {},
  ...props
}: ClassificationFormProps) {

  const form = useForm<ClassificationFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: ClassificationFormSchema) => {
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
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2 p-0.5 flex-1", className)}>
        <FormField
          control={form.control}
          name="name"

          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Text" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Classification Name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"

          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Classification Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Classification Description
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