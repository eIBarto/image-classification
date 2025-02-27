"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfirmResetPasswordFormSchema, ConfirmResetPasswordForm } from "./confirm-reset-password-form";
import { confirmResetPassword, ConfirmResetPasswordInput, CodeDeliveryDetails } from "aws-amplify/auth"
import React from "react";

export interface ConfirmResetPasswordCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmResetPasswordInput) => void
  codeDeliveryDetails?: CodeDeliveryDetails
  username: string
}

export function ConfirmResetPasswordCard({
  className,
  onComplete,
  username,
  //codeDeliveryDetails,
  ...props
}: ConfirmResetPasswordCardProps) {
// todo add additional info on codeDeliveryDetails

  async function handleSubmit(values: ConfirmResetPasswordFormSchema) {

    const input = {
      username: username,
      newPassword: values.newPassword,
      confirmationCode: values.confirmationCode,
    }

    await confirmResetPassword(input)
    onComplete(input)

    // todo return custom error message if needed
    //return "error code"
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Please enter your new password as well as the code sent you to update your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmResetPasswordForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}