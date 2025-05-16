import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Image Classification',
    template: '%s | Image Classification',
  },
  description: 'An AI-powered image classification tool',
};

export default function RootLayout({
  children,
}: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-svh bg-background font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-svh flex-col bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
