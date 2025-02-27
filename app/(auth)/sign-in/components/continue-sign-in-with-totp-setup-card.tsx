"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ConfirmSignInCodeForm, ConfirmSignInCodeFormSchema } from "./confirm-sign-in-code-form";
import { confirmSignIn, ConfirmSignInInput, ConfirmSignInOutput } from "aws-amplify/auth"
import { Copy } from "lucide-react";

export interface ContinueSignInWithTOTPSetupCardProps extends React.ComponentPropsWithoutRef<"div"> {
  onComplete: (input: ConfirmSignInInput, output: ConfirmSignInOutput) => Promise<void>
  uri: string,
  secretKey: string
}

export function ContinueSignInWithTOTPSetupCard({
  className,
  onComplete,
  uri,
  secretKey,
  ...props
}: ContinueSignInWithTOTPSetupCardProps) {

  async function handleSubmit(values: ConfirmSignInCodeFormSchema) {

    const input = {
      challengeResponse: values.code
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
            <p>To secure your account, you need to set up two-factor authentication (2FA).</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="key">Secret Key</TabsTrigger>
            </TabsList>
            <TabsContent value="qr" className="pt-4">
              <div className="p-4 bg-white rounded-lg flex justify-center">
                <QRCodeSVG
                  value={uri}
                  size={192}
                  level="M"
                />
              </div>
            </TabsContent>
            <TabsContent value="key" className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">
                If you can&apos;t scan the QR code, enter this secret key manually in your authenticator app:
              </p>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2">
                  <code className="px-4 py-2 bg-muted rounded text-sm select-all">
                    {secretKey}
                  </code>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="gap-2"
                    onClick={() => navigator.clipboard.writeText(secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                    <div className="sr-only">Copy secret key</div>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <ConfirmSignInCodeForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}