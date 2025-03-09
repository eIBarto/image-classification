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
  onSubmit: (values: ConfirmSignInPasswordFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function ConfirmSignInPasswordForm({ className, onSubmit, resetOnSuccess = true, disabled }: ConfirmSignInPasswordFormProps) {
  const form = useForm<ConfirmSignInPasswordFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },    
  })

  const { errors, isSubmitting } = form.formState

  const handleSubmit = form.handleSubmit(async (values: ConfirmSignInPasswordFormSchema) => {
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
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Enter your password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirming...</> : "Continue"}
        </Button>
      </form>
    </Form>
  )
}