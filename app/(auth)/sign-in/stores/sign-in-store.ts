import { createStore } from "@xstate/store"
import type { SignInOutput } from "aws-amplify/auth"

export type SignInStep = SignInOutput['nextStep']

export interface SignInContext {
    username?: string | undefined,
    step?: SignInStep | undefined,
    isSignedIn?: boolean,

}

export const signInStore = createStore({
    context: {
        step: undefined,
        isSignedIn: false,
        username: undefined,
    } as SignInContext,
    on: {
        updateContext: (context, event: { context: Partial<SignInContext> }) => ({
            ...context,
            ...event.context
        }),
        resetContext: (context) => ({
            ...context,
            step: undefined,
            isSignedIn: false,
            username: undefined,
        }),
        setStep: (context, event: { step: SignInStep }) => ({
            ...context,
            step: event.step
        }),
        setIsSignedIn: (context, event: { isSignedIn: boolean }) => ({
            ...context,
            isSignedIn: event.isSignedIn
        }),
        setUsername: (context, event: { username: string }) => ({
            ...context,
            username: event.username
        }),
    },
})