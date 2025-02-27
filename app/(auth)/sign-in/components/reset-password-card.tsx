"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

import { Button } from "@/components/ui/button";

export type ResetPasswordCardProps = React.ComponentPropsWithoutRef<"div">

export function ResetPasswordCard({
  className,
  ...props
}: ResetPasswordCardProps) {

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Your password must be reset in order to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href={"/reset-password"}>Reset Password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}