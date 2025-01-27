"use client"

import { useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { callbackUrlParsers, callbackUrlKeys } from "../hooks/use-callback-url"
import { useQueryStates } from "nuqs"
import { useRouter } from "next/navigation"

export function SignInDoneCard() { // todo improve upon this
    const router = useRouter()
    const [{ callbackUrl }] = useQueryStates(callbackUrlParsers, { urlKeys: callbackUrlKeys })

    useEffect(() => {
        router.push(callbackUrl || "/dashboard")
    }, [callbackUrl, router])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign In Complete</CardTitle>
                <CardDescription>You can now sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    You have been signed in successfully.
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button className="w-full" asChild>
                    <Link href={callbackUrl || "/dashboard"} >Continue to {callbackUrl ? "your page" : "dashboard"}</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}