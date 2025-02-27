import { SignUpFlow } from "./components/sign-up-flow"
import { callbackUrlSearchParamsCache } from "../hooks/use-callback-url"
import { type SearchParams } from 'nuqs/server'

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const { callbackUrl } = await callbackUrlSearchParamsCache.parse(searchParams)

  console.log(callbackUrl)

  return (
    <div className="flex flex-col gap-6">
      <SignUpFlow />
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}