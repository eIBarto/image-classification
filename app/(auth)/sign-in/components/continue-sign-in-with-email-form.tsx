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

export type ContinueSignInWithEmailFormSchema = z.infer<typeof formSchema>;

export interface ContinueSignInWithEmailFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit: (values: ContinueSignInWithEmailFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function ContinueSignInWithEmailForm({ className, onSubmit, resetOnSuccess = true, disabled }: ContinueSignInWithEmailFormProps) {
  const form = useForm<ContinueSignInWithEmailFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  const handleSubmit = form.handleSubmit(async (values: ContinueSignInWithEmailFormSchema) => {
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
          name="email"
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Enter your email.
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