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
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional()
});

export type PromptFormSchema = z.infer<typeof formSchema>;

export interface PromptFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: PromptFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
  defaultValues?: Partial<PromptFormSchema>
}

export function PromptForm({
  className,
  onSubmit,
  resetOnSuccess = true,
  defaultValues = {},
  ...props
}: PromptFormProps) {

  const form = useForm<PromptFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      description: "",
      ...defaultValues
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: PromptFormSchema) => {
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
          name="summary"

          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Summary" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Prompt Summary
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
                  placeholder="Prompt Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Prompt Description
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