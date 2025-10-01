"use client";
/**
 * Global client-side providers for the app
 * - Amplify config (SSR mode)
 * - React Query client
 * - Theme provider and Toaster notifications
 */

import { AmplifyProvider } from "@/components/amplify-provider";
import { QueryClientProvider } from "@/components/query-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "@/components/ui/sonner"

import { PropsWithChildren } from "react";

/**
 * Composes client-side context providers. Avoid heavy logic here.
 */
export default function Providers({ children }: PropsWithChildren) {
    return (
        <AmplifyProvider>
            <NuqsAdapter>
                <QueryClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </QueryClientProvider>
            </NuqsAdapter>
            <Toaster />
        </AmplifyProvider>
    );
}