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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { CodeDeliveryDetails } from "aws-amplify/auth"


const formSchema = z.object({
  code: z.string().min(6, { message: 'Invalid code' }),
})

export type ConfirmSignInCodeFormSchema = z.infer<typeof formSchema>;

export interface ConfirmSignInCodeFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  codeDeliveryDetails?: CodeDeliveryDetails
  onSubmit: (values: ConfirmSignInCodeFormSchema) => Promise<void | string>
  resetOnSuccess?: boolean
}

export function ConfirmSignInCodeForm({ className, onSubmit, resetOnSuccess = true }: ConfirmSignInCodeFormProps) {
  const form = useForm<ConfirmSignInCodeFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  async function handleSubmit(values: ConfirmSignInCodeFormSchema) {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-4", className)}>
        {/*<FormField here we could display further information on the delivery details
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />*/}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup >
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the code from your authenticator app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}