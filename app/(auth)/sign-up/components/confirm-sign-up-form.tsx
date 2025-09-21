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
});

export type ConfirmSignUpFormSchema = z.infer<typeof formSchema>;

export interface ConfirmSignUpFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  codeDeliveryDetails?: CodeDeliveryDetails
  onSubmit: (values: ConfirmSignUpFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function ConfirmSignUpForm({ className, onSubmit, resetOnSuccess = true, disabled }: ConfirmSignUpFormProps) {
  const form = useForm<ConfirmSignUpFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  const handleSubmit = form.handleSubmit(async (values: ConfirmSignUpFormSchema) => {
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
          name="code"
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field} disabled={disabled || isSubmitting}>
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
                Please enter the one-time password sent to your phone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing up...</> : "Sign up"}
        </Button>
      </form>
    </Form>
  )
}