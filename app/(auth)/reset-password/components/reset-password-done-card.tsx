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

export function ResetPasswordDoneCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset Password Complete</CardTitle>
                <CardDescription>You can now sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Your password has been reset successfully. Sign in to continue.
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button className="w-full" asChild>
                    <Link href="/sign-in">Continue to Sign In</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}