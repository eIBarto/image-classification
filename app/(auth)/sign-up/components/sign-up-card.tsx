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

import { SignUpFormSchema, SignUpForm } from "./sign-up-form";
import { signUp, SignUpInput, SignUpOutput } from "aws-amplify/auth"

export interface SignUpCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: SignUpInput, output: SignUpOutput) => Promise<void>
}

export function SignUpCard({
  className,
  onComplete,
  ...props
}: SignUpCardProps) {

  async function handleSubmit(values: SignUpFormSchema) {

    const input = {
      username: values.email,
      password: values.password,
      options: {
        userAttributes: {
          email: values.email,
        },
      },
      autoSignIn: {
        authFlowType: 'USER_AUTH',
      },
    }
    const output = await signUp(input)
    await onComplete(input, output)

    // todo return custom error message if needed
    //return "error code"
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
          <SignUpForm onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter>
          <div className="mt-4 text-center text-sm w-full">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}