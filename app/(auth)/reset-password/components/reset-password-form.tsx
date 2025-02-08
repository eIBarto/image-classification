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

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export type ResetPasswordFormSchema = z.infer<typeof formSchema>;

export interface ResetPasswordFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit: (values: ResetPasswordFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function ResetPasswordForm({ className, onSubmit, resetOnSuccess = true, ...props }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  async function handleSubmit(values: ResetPasswordFormSchema) {
    try {
      const result = await onSubmit(values)
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
  }

  return (
    <Form {...form}>
      <form onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit(handleSubmit)(event)
      }} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="email"
          disabled={isSubmitting || disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" {...field} />
              </FormControl>
              <FormDescription>
                This is your email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Reset password"}
        </Button>
      </form>
    </Form>
  )
}