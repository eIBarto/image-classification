"use client";

import { AmplifyProvider } from "@/components/amplify-provider";
import { QueryClientProvider } from "@/components/query-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { PropsWithChildren } from "react";

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
        </AmplifyProvider>
    );
}