"use client"
/** Card for continuing sign-in with email input */

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ContinueSignInWithEmailFormSchema, ContinueSignInWithEmailForm } from "./continue-sign-in-with-email-form";
import { confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"

export interface ContinueSignInWithEmailCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => Promise<void>
}

export function ContinueSignInWithEmailCard({
  className,
  onComplete,
  ...props
}: ContinueSignInWithEmailCardProps) {

  async function handleSubmit(values: ContinueSignInWithEmailFormSchema) {

    const input = {
      challengeResponse: values.email
    }
    const output = await confirmSignIn(input)
    await onComplete(input, output)

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Continue sign in</CardTitle>
          <CardDescription>
            Enter your email below to continue your sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContinueSignInWithEmailForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}