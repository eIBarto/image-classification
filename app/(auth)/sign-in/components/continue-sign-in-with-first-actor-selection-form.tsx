"use client"

import { cn } from "@/lib/utils"

import { CircleUserRound, Dice6, Earth, Key, Loader2, MonitorSmartphone, Shield } from "lucide-react"

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

const formSchema = z.object({
  type: z.enum(["SMS", "TOTP", "EMAIL"], {
    required_error: "You need to select a MFA type.",
  }),
});

export type ContinueSignInWithFirstActorSelectionFormSchema = z.infer<typeof formSchema>;

export type ChallengeName = 'SMS_MFA' | 'SMS_OTP' | 'SOFTWARE_TOKEN_MFA' | 'EMAIL_OTP' | 'SELECT_MFA_TYPE' | 'SELECT_CHALLENGE' | 'MFA_SETUP' | 'PASSWORD' | 'PASSWORD_SRP' | 'PASSWORD_VERIFIER' | 'CUSTOM_CHALLENGE' | 'DEVICE_SRP_AUTH' | 'DEVICE_PASSWORD_VERIFIER' | 'ADMIN_NO_SRP_AUTH' | 'NEW_PASSWORD_REQUIRED' | 'WEB_AUTHN'; // import from aws-sdk
export type ChallengeNames = ChallengeName[]; // import from aws-sdk

export const challenges = [
  {
    value: "SMS_MFA",
    label: "SMS",
    icon: <PhoneIcon className="h-4 w-4" />
  },
  {
    value: "SOFTWARE_TOKEN_MFA",
    label: "Authenticator App",
    icon: <KeyIcon className="h-4 w-4" />
  },
  {
    value: "EMAIL_OTP",
    label: "Email",
    icon: <MailIcon className="h-4 w-4" />
  },
  {
    value: "SELECT_MFA_TYPE",
    label: "Select MFA Type",
    icon: <Shield className="h-4 w-4" />
  },
  {
    value: "SELECT_CHALLENGE",
    label: "Select Challenge",
    icon: <Dice6 className="h-4 w-4" />
  },
  {
    value: "MFA_SETUP",
    label: "MFA Setup",
    icon: <Shield className="h-4 w-4" />
  },
  {
    value: "PASSWORD",
    label: "Password",
    icon: <Key className="h-4 w-4" />
  },
  {
    value: "PASSWORD_SRP",
    label: "Password SRP",
    icon: <Key className="h-4 w-4" />
  },
  {
    value: "PASSWORD_VERIFIER",
    label: "Password Verifier",
    icon: <Key className="h-4 w-4" />
  },
  {
    value: "CUSTOM_CHALLENGE",
    label: "Custom Challenge",
    icon: <Dice6 className="h-4 w-4" />
  },
  {
    value: "DEVICE_SRP_AUTH",
    label: "Device SRP Auth",
    icon: <MonitorSmartphone className="h-4 w-4" />
  },
  {
    value: "DEVICE_PASSWORD_VERIFIER",
    label: "Device Password Verifier",
    icon: <MonitorSmartphone className="h-4 w-4" />
  },
  {
    value: "ADMIN_NO_SRP_AUTH",
    label: "Admin No SRP Auth",
    icon: <CircleUserRound className="h-4 w-4" />
  },
  {
    value: "NEW_PASSWORD_REQUIRED",
    label: "New Password Required",
    icon: <Key className="h-4 w-4" />
  },
  {
    value: "WEB_AUTHN",
    label: "Web Authn",
    icon: <Earth className="h-4 w-4" />
  },
  
]

export interface ContinueSignInWithFirstActorSelectionFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit: (values: ContinueSignInWithFirstActorSelectionFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  availableChallenges: ChallengeNames
  disabled?: boolean
}

export function ContinueSignInWithFirstActorSelectionForm({ className, onSubmit, resetOnSuccess = true, disabled, availableChallenges }: ContinueSignInWithFirstActorSelectionFormProps) {
  const form = useForm<ContinueSignInWithFirstActorSelectionFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
    },
  })

  const { errors, isSubmitting } = form.formState

  const filteredChallenges = challenges.filter((challenge) => availableChallenges.includes(challenge.value as ChallengeName))

  if (filteredChallenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed rounded-lg">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="font-semibold">No Authentication Methods Available</h3>
          <p className="text-sm text-muted-foreground">
            There are currently no authentication methods available for your account.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = form.handleSubmit(async (values: ContinueSignInWithFirstActorSelectionFormSchema) => {
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
          name="type"
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>authentication method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled || isSubmitting}
                  className="flex flex-col"
                >
                  {filteredChallenges.map((challenge) => (
                    <FormItem key={challenge.value} className="flex-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value={challenge.value}
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                        {challenge.icon}
                        <span className="text-sm font-medium">{challenge.label}</span>
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