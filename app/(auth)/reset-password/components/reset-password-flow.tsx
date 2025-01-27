"use client"

import { ResetPasswordCard } from "./reset-password-card";
import { ResetPasswordInput, ResetPasswordOutput, ConfirmResetPasswordInput } from "aws-amplify/auth"
import { useSelector } from "@xstate/store/react"
import { resetPasswordStore } from "../stores/reset-password-store"
import { ResetPasswordDoneCard } from "./reset-password-done-card";
import { ConfirmResetPasswordCard } from "./confirm-reset-password-card";

export type ResetPasswordStep = ResetPasswordOutput['nextStep']

export function ResetPasswordFlow() {
  const step = useSelector(resetPasswordStore, state => state.context.step)
  const username = useSelector(resetPasswordStore, state => state.context.username)
  const isPasswordReset = useSelector(resetPasswordStore, state => state.context.isPasswordReset)

  async function handleResetPassword(input: ResetPasswordInput, output: ResetPasswordOutput) {
    const { isPasswordReset, nextStep } = output
    const { username } = input

    resetPasswordStore.send({
      type: "updateContext",
      context: {
        step: nextStep,
        username: username,
        isPasswordReset: isPasswordReset,
      }
    })
  }

  async function handleConfirmResetPassword(input: ConfirmResetPasswordInput) {
    //const { isPasswordReset, nextStep } = output

    resetPasswordStore.send({
      type: "updateContext",
      context: {
        step: undefined, //{ resetPasswordStep: 'DONE' },
        isPasswordReset: true
      }
    })
  }

  if (isPasswordReset) {
    return <ResetPasswordDoneCard />
  }

  if (!step || !username) {
    return <ResetPasswordCard onComplete={handleResetPassword} />
  }
  // if done or isResetPasswordComplete, return done card

  switch (step.resetPasswordStep) {
    case "CONFIRM_RESET_PASSWORD_WITH_CODE":
      return <ConfirmResetPasswordCard username={username} codeDeliveryDetails={step.codeDeliveryDetails} onComplete={handleConfirmResetPassword} />
    case "DONE":
      return <ResetPasswordDoneCard />
  }
}
