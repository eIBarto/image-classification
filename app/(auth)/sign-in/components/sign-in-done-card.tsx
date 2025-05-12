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

import { callbackUrlParsers, callbackUrlKeys } from "../../hooks/use-callback-url"
import { useQueryStates } from "nuqs"
import { useRouter } from "next/navigation"
import { useTimer } from "../../hooks/use-timer"


// todo present user with multiple different options to continue if callbackUrl is unset. May skip timer
export function SignInDoneCard() {
    const router = useRouter()
    const [{ callbackUrl }] = useQueryStates(callbackUrlParsers, { urlKeys: callbackUrlKeys })
    const { time, isRunning } = useTimer(3000, 1000)

    useEffect(() => {
        router.push(callbackUrl || "/projects")
    }, [router, callbackUrl])

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
                <Button className="w-full" asChild disabled={isRunning}>
                    <Link href={callbackUrl || "/projects"}>
                        {isRunning 
                            ? `Continue in ${Math.ceil(time / 1000)}s...`
                            : `Continue to ${callbackUrl ? "your page" : "projects"}`
                        }
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}