"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { autoSignIn, SignInOutput } from "aws-amplify/auth"
import { useMutation } from "@tanstack/react-query"

export interface CompleteAutoSignInCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (output: SignInOutput) => void
}

export function CompleteAutoSignInCard({
  className,
  onComplete,
  ...props
}: CompleteAutoSignInCardProps) {

  const { data, error, mutate, isPending } = useMutation({
    mutationKey: ['autoSignIn'],
    mutationFn: autoSignIn,
    onSuccess: (data) => {
      onComplete(data)
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Completing Sign Up
          </CardTitle>
          <CardDescription>
            {error
              ? "We couldn't complete the automatic sign in process"
              : "Please wait while we complete your registration"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {isPending && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {error && (
            <p className="text-red-500">Error: {error.message}</p>
          )}
        </CardContent>
        {(error || data?.isSignedIn === false) && (
          <CardFooter>
            <Button asChild variant="link">
              <Link href="/sign-in">Go to Sign In</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}