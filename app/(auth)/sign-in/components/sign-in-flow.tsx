"use client"
/**
 * Orchestrates sign-in flow steps driven by Amplify Auth nextStep
 */

import { SignInCard } from "./sign-in-card";
import { ConfirmSignInInput, ConfirmSignInOutput, ConfirmSignUpOutput, ConfirmSignUpInput, SignInInput, SignInOutput, autoSignIn } from "aws-amplify/auth"
import { useSelector } from "@xstate/store/react"
import { signInStore } from "../stores/sign-in-store"
import { SignInDoneCard } from "./sign-in-done-card";
import { ConfirmSignInCard } from "./confirm-sign-in-card";
import { ConfirmSignInWithNewPasswordCard } from "./confirm-sign-in-with-new-password-card";
import { ConfirmSignInWithPasswordCard } from "./confirm-sign-in-with-password-card";
import { ContinueSignInWithMFASelectionCard } from "./continue-sign-in-with-mfa-selection-card";
import { ContinueSignInWithTOTPSetupCard } from "./continue-sign-in-with-totp-setup-card";
import { ContinueSignInWithEmailCard } from "./continue-sign-in-with-email-card";
import { ContinueSignInWithFirstActorSelectionCard } from "./continue-sign-in-with-fist-actor-selection-card";
import { ResetPasswordCard } from "./reset-password-card";
import { ConfirmSignUpCard } from "../../sign-up/components/confirm-sign-up-card";

export type SignInStep = SignInOutput['nextStep']

export function SignInFlow() {
  const username = useSelector(signInStore, state => state.context.username)
  const step = useSelector(signInStore, state => state.context.step)
  const isSignedIn = useSelector(signInStore, state => state.context.isSignedIn)

  async function handleSignIn(input: SignInInput, output: SignInOutput) {
    const { isSignedIn, nextStep } = output
    const { username } = input

    signInStore.send({
      type: "updateContext",
      context: {
        step: nextStep,
        isSignedIn: isSignedIn,
        username: username
      }
    })
  }

  async function handleConfirmSignIn(input: ConfirmSignInInput, output: ConfirmSignInOutput) {
    const { isSignedIn, nextStep } = output

    signInStore.send({
      type: "updateContext",
      context: {
        step: nextStep,
        isSignedIn: isSignedIn
      }
    })
  }

  async function handleConfirmSignUp(input: ConfirmSignUpInput, output: ConfirmSignUpOutput) {
    const {  nextStep } = output

    switch (nextStep.signUpStep) {
      case "COMPLETE_AUTO_SIGN_IN":
        const { isSignedIn, nextStep } = await autoSignIn()
        signInStore.send({
          type: "updateContext",
          context: {
            step: nextStep,
            isSignedIn: isSignedIn
          }
        })
        break;
      case "DONE":
        signInStore.send({
          type: "resetContext",
        })
      case "CONFIRM_SIGN_UP":
        break;
    }
  }

  if (isSignedIn) {
    return <SignInDoneCard />
  }

  if (!step || !username) {
    return <SignInCard onComplete={handleSignIn} />
  }

  switch (step.signInStep) {
    case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE':
      return <ConfirmSignInCard onComplete={handleConfirmSignIn} />
    case 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION':
      return <ContinueSignInWithMFASelectionCard allowedMFATypes={step.allowedMFATypes ?? ["EMAIL", "SMS", "TOTP"]} onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
      return <ConfirmSignInWithNewPasswordCard onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
      return <ConfirmSignInCard codeDeliveryDetails={step.codeDeliveryDetails} onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return <ConfirmSignInCard onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
      return <ConfirmSignInCard codeDeliveryDetails={step.codeDeliveryDetails} onComplete={handleConfirmSignIn} />
    case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
      return <ContinueSignInWithTOTPSetupCard uri={"totpSetupDetails.getSetupUri()"} secretKey={"totpSetupDetails.sharedSecret"} onComplete={handleConfirmSignIn} />
    case 'CONTINUE_SIGN_IN_WITH_EMAIL_SETUP':
      return <ContinueSignInWithEmailCard onComplete={handleConfirmSignIn} />
    case 'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION':
      return <ContinueSignInWithMFASelectionCard allowedMFATypes={step.allowedMFATypes ?? ["EMAIL", "TOTP"]} onComplete={handleConfirmSignIn} />
    case 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION':
      return <ContinueSignInWithFirstActorSelectionCard availableChallenges={step.availableChallenges ?? ['PASSWORD_SRP', 'PASSWORD', 'WEB_AUTHN', 'EMAIL_OTP']} onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_IN_WITH_PASSWORD':
      return <ConfirmSignInWithPasswordCard onComplete={handleConfirmSignIn} />
    case 'CONFIRM_SIGN_UP':
      return <ConfirmSignUpCard username={username} onComplete={handleConfirmSignUp} />
    case 'RESET_PASSWORD':
      return <ResetPasswordCard />
    case 'DONE':
      return <SignInDoneCard />
  }
}
