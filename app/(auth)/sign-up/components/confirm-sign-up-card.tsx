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
import { Button } from "@/components/ui/button"

import { ConfirmSignUpFormSchema, ConfirmSignUpForm } from "./confirm-sign-up-form";
import { CodeDeliveryDetails, confirmSignUp, ConfirmSignUpInput, ConfirmSignUpOutput, resendSignUpCode } from "aws-amplify/auth"
import React from "react";
import { useTimer } from "../../hooks/use-timer";

export interface ConfirmSignUpCardProps extends React.ComponentPropsWithoutRef<"div"> {
  username: string
  codeDeliveryDetails?: CodeDeliveryDetails
  onComplete: (input: ConfirmSignUpInput, output: ConfirmSignUpOutput) => void
  resendDelay?: number
}

export function ConfirmSignUpCard({
  className,
  username,
  codeDeliveryDetails,
  onComplete,
  resendDelay = 60,
  ...props
}: ConfirmSignUpCardProps) {
  const { time, reset } = useTimer(resendDelay * 1000, 1000)
  const canResend = time === 0

  async function handleSubmit(values: ConfirmSignUpFormSchema) {

    const input = {
      username: username,
      confirmationCode: values.code,
    }

    const output = await confirmSignUp(input)
    onComplete(input, output)

  }

  async function handleResendCode() {
    if (!canResend) return
    const details = await resendSignUpCode({ username: username })
    console.log("sent code to", details)
    reset()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            Enter your email below to sign up to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmSignUpForm codeDeliveryDetails={codeDeliveryDetails} onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={!canResend}
          >
            {canResend ? 'Resend code' : `Resend code (${Math.ceil(time / 1000)}s)`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}