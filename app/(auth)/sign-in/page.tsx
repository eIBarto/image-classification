import { callbackUrlSearchParamsCache } from "../hooks/use-callback-url"
import { type SearchParams } from 'nuqs/server'
import { SignInFlow } from "./components/sign-in-flow"
import type { Metadata } from 'next'

type PageProps = {
  searchParams: Promise<SearchParams>
}

export const metadata: Metadata = {
  title: 'Sign In | Image Classification',
}

export default async function SignInPage({ searchParams }: PageProps) {
  await callbackUrlSearchParamsCache.parse(searchParams)

  return (
    <div className="flex flex-col gap-6">
      <SignInFlow />
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}