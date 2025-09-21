"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfirmSignInPasswordFormSchema, ConfirmSignInPasswordForm } from "./confirm-sign-in-password-form";
import { confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"

export interface ConfirmSignInWithPasswordCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => Promise<void>
}

export function ConfirmSignInWithPasswordCard({
  className,
  onComplete,
  ...props
}: ConfirmSignInWithPasswordCardProps) {

  async function handleSubmit(values: ConfirmSignInPasswordFormSchema) {

    const input = {
      challengeResponse: values.password
    }
    const output = await confirmSignIn(input)
    await onComplete(input, output)

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Confirm sign in</CardTitle>
          <CardDescription>
            Enter your password below to confirm your sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmSignInPasswordForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}