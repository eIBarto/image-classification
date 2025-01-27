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

import { ResetPasswordFormSchema, ResetPasswordForm } from "./reset-password-form";
import { resetPassword, ResetPasswordInput, ResetPasswordOutput } from "aws-amplify/auth"
import { Button } from "@/components/ui/button";

export interface ResetPasswordCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ResetPasswordInput, output: ResetPasswordOutput) => Promise<void>
}

export function ResetPasswordCard({
  className,
  onComplete,
  ...props
}: ResetPasswordCardProps) {

  async function handleSubmit(values: ResetPasswordFormSchema) {

    const input = {
      username: values.email,
    }
    const output = await resetPassword(input)
    await onComplete(input, output)

    // todo return custom error message if needed
    //return "error code"
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email below to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/sign-in">
              Back to sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}