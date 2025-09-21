"use client"
/** Entry card for sign-in with email/password */

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

import { SignInFormSchema, SignInForm } from "./sign-in-form";
import { signIn, SignInInput, SignInOutput } from "aws-amplify/auth"

export interface SignInCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: SignInInput, output: SignInOutput) => Promise<void>
}

export function SignInCard({
  className,
  onComplete,
  ...props
}: SignInCardProps) {

  async function handleSubmit(values: SignInFormSchema) {

    const input = {
      username: values.email,
      password: values.password,
      options: {
        userAttributes: {
          email: values.email,
        },
      },
    }
    const output = await signIn(input)
    await onComplete(input, output)

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter>
          <div className="mt-4 text-center text-sm w-full">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}