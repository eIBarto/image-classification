"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfirmSignInCodeFormSchema, ConfirmSignInCodeForm } from "./confirm-sign-in-code-form";
import { CodeDeliveryDetails, confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"
import React from "react";

export interface ConfirmSignInCardProps extends React.ComponentPropsWithoutRef<"div"> {
  codeDeliveryDetails?: CodeDeliveryDetails
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => void
}

export function ConfirmSignInCard({
  className,
  codeDeliveryDetails,
  onComplete,
  ...props
}: ConfirmSignInCardProps) {

  async function handleSubmit(values: ConfirmSignInCodeFormSchema) {

    const input = {
      challengeResponse: values.code,
    }

    const output = await confirmSignIn(input)
    onComplete(input, output)

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Confirm sign in</CardTitle>
          <CardDescription>
            Please confirm your sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmSignInCodeForm codeDeliveryDetails={codeDeliveryDetails} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}