// Auth gate for app routes: redirects unauthenticated users to sign-in
import { NextRequest, NextResponse } from "next/server";

import { fetchAuthSession } from "aws-amplify/auth/server";

import { runWithAmplifyServerContext } from "@/lib/amplify-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = new URL(request.url);

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, {});
        return session.tokens !== undefined;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  if (authenticated) {
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/projects", request.url));
    }
    return response;
  }

  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const relativeUrl = url.pathname + url.search + url.hash;

  const searchParams = new URLSearchParams({ callbackUrl: relativeUrl });
  return NextResponse.redirect(new URL(`/sign-in?${searchParams.toString()}`, request.url));
}

export const config = {
  matcher: [
    // Public paths excluded from auth
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|reset-password).*)",
  ],
};
