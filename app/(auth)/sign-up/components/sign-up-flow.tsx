"use client"

import { SignUpCard } from "./sign-up-card";
import { ConfirmSignUpInput, ConfirmSignUpOutput, SignInOutput, SignUpInput, SignUpOutput } from "aws-amplify/auth"
import { useSelector } from "@xstate/store/react"
import { signUpStore } from "../stores/sign-up-store"
import { ConfirmSignUpCard } from "./confirm-sign-up-card";
import { CompleteAutoSignInCard } from "./complete-auto-sign-in-card";
import { SignUpDoneCard } from "./sign-up-done-card";
import { SignInDoneCard } from "../../sign-in/components/sign-in-done-card";

export type SignUpStep = SignUpOutput['nextStep']


// todo may invoke autoSignIn here and not in the component but calling it in the component ensures that is is reliably called
export function SignUpFlow() {
  const step = useSelector(signUpStore, state => state.context.step)
  const username = useSelector(signUpStore, state => state.context.username)
  const isSignedIn = useSelector(signUpStore, state => state.context.isSignedIn)
  const isSignUpComplete = useSelector(signUpStore, state => state.context.isSignUpComplete)

  async function handleSignUp(input: SignUpInput, output: SignUpOutput) {
    const { isSignUpComplete, nextStep } = output
    const { username } = input

    signUpStore.send({
      type: "updateContext",
      context: {
        step: nextStep,
        username: username,
        isSignUpComplete: isSignUpComplete,
      }
    })
  }

  async function handleConfirmSignUp(input: ConfirmSignUpInput, output: ConfirmSignUpOutput) {
    const { isSignUpComplete, nextStep } = output

    signUpStore.send({
      type: "updateContext",
      context: {
        step: nextStep,
        isSignUpComplete: isSignUpComplete
      }
    })
  }

  async function handleCompleteAutoSignIn(output: SignInOutput) {
    const { isSignedIn, nextStep } = output
    console.log(`auto sign in complete ${isSignedIn} - ${nextStep}`)

    // nie per default redirecten ausßer es geht => login statt content
    // IF isSignedIn => user kann zu page redirected werden
    // todo logik überprüfen
    // was tun wenn anderer sign in step als "DONE"

    //cobnsider documentation that checks next step
    signUpStore.send({
      type: "updateContext",
      context: {
        step: undefined, // done prompt user to login or set to undefined
        //isSignUpComplete: true, // isSignedIn  todo review as user should be signed up even when auto sign in fails
        isSignedIn: isSignedIn
      }
    })
  }

  if (isSignedIn) { // todo or auto redirect
    return <SignInDoneCard /> // hier die redirect card
  }    

  if (isSignUpComplete) {
    return <SignUpDoneCard />
  }

  if (!step || !username) {
    return <SignUpCard onComplete={handleSignUp} />
  }

  switch (step.signUpStep) {
    case "CONFIRM_SIGN_UP":
      return <ConfirmSignUpCard username={username} codeDeliveryDetails={step.codeDeliveryDetails} onComplete={handleConfirmSignUp} />
    case "COMPLETE_AUTO_SIGN_IN":
      return <CompleteAutoSignInCard onComplete={handleCompleteAutoSignIn} />
    case "DONE":
      return <SignUpDoneCard />
  }
}
