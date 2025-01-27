import { ResetPasswordFlow } from "./components/reset-password-flow"

export default async function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <ResetPasswordFlow />
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}