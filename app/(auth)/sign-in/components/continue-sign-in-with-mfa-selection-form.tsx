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
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"

import {
  PhoneIcon,
  KeyIcon,
  MailIcon
} from "lucide-react"

import { Shield } from "lucide-react"

const formSchema = z.object({
  type: z.enum(["SMS", "TOTP", "EMAIL"], {
    required_error: "You need to select a MFA type.",
  }),
});

export type ContinueSignInWithMFASelectionFormSchema = z.infer<typeof formSchema>;

export type AuthMFAType = 'SMS' | 'TOTP' | 'EMAIL'; // import from aws-sdk
export type AuthAllowedMFATypes = AuthMFAType[]; // import from aws-sdk

export const types = [
  {
    value: "SMS",
    label: "SMS",
    icon: <PhoneIcon className="h-4 w-4" />
  },
  {
    value: "TOTP",
    label: "Authenticator App",
    icon: <KeyIcon className="h-4 w-4" />
  },
  {
    value: "EMAIL",
    label: "Email",
    icon: <MailIcon className="h-4 w-4" />
  },
]

export interface ContinueSignInWithMFASelectionFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit: (values: ContinueSignInWithMFASelectionFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  allowedMFATypes: AuthAllowedMFATypes
  disabled?: boolean
}

export function ContinueSignInWithMFASelectionForm({ className, onSubmit, resetOnSuccess = true, allowedMFATypes, ...props }: ContinueSignInWithMFASelectionFormProps) {
  const form = useForm<ContinueSignInWithMFASelectionFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState
  const filteredTypes = types.filter((type) => 
    allowedMFATypes.includes(type.value as AuthMFAType)
  )

  if (filteredTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed rounded-lg">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="font-semibold">No MFA Methods Available</h3>
          <p className="text-sm text-muted-foreground">
            There are currently no MFA methods available for your account.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(values: ContinueSignInWithMFASelectionFormSchema) {
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
          name="type"
          disabled={isSubmitting || disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>authentication method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={field.disabled}
                  className="flex flex-col"
                >
                  {filteredTypes.map((type) => (
                    <FormItem key={type.value} className="flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value={type.value}
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                        {type.icon}
                        <span className="text-sm font-medium">{type.label}</span>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Choose how you want to verify your identity
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