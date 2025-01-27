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
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
});

export type ConfirmSignInPasswordFormSchema = z.infer<typeof formSchema>;

export interface ConfirmSignInPasswordFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit: (values: ConfirmSignInPasswordFormSchema) => Promise<void | string>
  resetOnSuccess?: boolean
}

export function ConfirmSignInPasswordForm({ className, onSubmit, resetOnSuccess = true }: ConfirmSignInPasswordFormProps) {
  const form = useForm<ConfirmSignInPasswordFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  async function handleSubmit(values: ConfirmSignInPasswordFormSchema) {
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormDescription>
                Enter your password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirming...</> : "Confirm"}
        </Button>
      </form>
    </Form>
  )
}