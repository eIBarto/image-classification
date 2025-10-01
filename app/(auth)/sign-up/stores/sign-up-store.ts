import { createStore } from "@xstate/store"
import type { SignUpOutput } from "aws-amplify/auth"

export type SignUpStep = SignUpOutput['nextStep']

export interface SignUpContext {
    username?: string | undefined,
    step?: SignUpStep | undefined,
    isSignUpComplete: boolean,
    isSignedIn: boolean,

}

export const signUpStore = createStore({
    context: {
        username: undefined,
        step: undefined,
        isSignUpComplete: false,
        isSignedIn: false,
    } as SignUpContext,
    on: {
        updateContext: (context, event: { context: Partial<SignUpContext> }) => ({
            ...context,
            ...event.context
        }),
        setStep: (context, event: { step: SignUpStep }) => ({
            ...context,
            step: event.step
        }),
        setIsSignUpComplete: (context, event: { isSignUpComplete: boolean }) => ({
            ...context,
            isSignUpComplete: event.isSignUpComplete
        }),
        setIsSignedIn: (context, event: { isSignedIn: boolean }) => ({
            ...context,
            isSignedIn: event.isSignedIn
        }),
    },
})