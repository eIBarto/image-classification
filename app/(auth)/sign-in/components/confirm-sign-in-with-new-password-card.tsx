"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

import { ConfirmSignInPasswordFormSchema, ConfirmSignInPasswordForm } from "./confirm-sign-in-password-form";
import { confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"

export interface ConfirmSignInWithNewPasswordCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => Promise<void>
}

export function ConfirmSignInWithNewPasswordCard({
  className,
  onComplete,
  ...props
}: ConfirmSignInWithNewPasswordCardProps) {

  async function handleSubmit(values: ConfirmSignInPasswordFormSchema) {

    const input = {
      challengeResponse: values.password
    }
    const output = await confirmSignIn(input)
    await onComplete(input, output)

    // todo return custom error message if needed
    //return "error code"
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Confirm sign in</CardTitle>
          <CardDescription>
            Enter your new password below to confirm your sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmSignInPasswordForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}