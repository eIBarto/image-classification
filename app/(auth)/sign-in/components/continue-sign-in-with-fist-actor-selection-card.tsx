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

import { ContinueSignInWithFirstActorSelectionFormSchema, ContinueSignInWithFirstActorSelectionForm, ChallengeName } from "./continue-sign-in-with-first-actor-selection-form";
import { confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"
import { Button } from "@/components/ui/button";

export interface ContinueSignInWithFirstActorSelectionCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => Promise<void>
  availableChallenges: Array<ChallengeName>
}

export function ContinueSignInWithFirstActorSelectionCard({
  className,
  availableChallenges,
  onComplete,
  ...props
}: ContinueSignInWithFirstActorSelectionCardProps) {

  async function handleSubmit(values: ContinueSignInWithFirstActorSelectionFormSchema) {

    const input = {
      challengeResponse: values.type
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
          <CardTitle className="text-2xl">Continue sign in</CardTitle>
          <CardDescription>
            Select the authentication method you want to use to continue your sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContinueSignInWithFirstActorSelectionForm availableChallenges={availableChallenges} onSubmit={handleSubmit} />
        </CardContent>
        {availableChallenges.length === 0 && (
          <CardFooter>
            <Button className="w-full">
              <Link href="/sign-in" >
                Back to sign in
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}