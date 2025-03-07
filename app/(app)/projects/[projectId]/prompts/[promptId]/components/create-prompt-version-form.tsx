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
//import { ManagedUserCommandList } from "./managed-user-command-list"

const formSchema = z.object({
  version: z.number().min(1, "Version is required"),
  text: z.string().min(1, "Text is required"),
});

export type CreatePromptVersionFormSchema = z.infer<typeof formSchema>;

export interface CreatePromptVersionFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: CreatePromptVersionFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function CreatePromptVersionForm({ className, onSubmit, resetOnSuccess = true, ...props }: CreatePromptVersionFormProps) {
  const form = useForm<CreatePromptVersionFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: undefined,
      text: "",
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreatePromptVersionFormSchema) => {
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
          name="text"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Text" {...field} disabled={disabled || isSubmitting} />
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
          name="version"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input type="number" defaultValue={value} onChange={e => onChange(e.target.valueAsNumber)} placeholder="Version" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Prompt version
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Continue"}
        </Button>
      </form>
    </Form>
  )
}