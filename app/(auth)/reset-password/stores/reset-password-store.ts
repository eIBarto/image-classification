import { createStore } from "@xstate/store"
import type { ResetPasswordOutput } from "aws-amplify/auth"

export type ResetPasswordStep = ResetPasswordOutput['nextStep']

export interface ResetPasswordContext {
    username?: string | undefined,
    step?: ResetPasswordStep | undefined,
    isPasswordReset: boolean,

}

export const resetPasswordStore = createStore({
    context: {
        step: undefined,
        isPasswordReset: false,
        isSignedIn: false,
    } as ResetPasswordContext,
    on: {
        updateContext: (context, event: { context: Partial<ResetPasswordContext> }) => ({
            ...context,
            ...event.context
        }),
        setStep: (context, event: { step: ResetPasswordStep }) => ({
            ...context,
            step: event.step
        }),
        setIsResetPasswordComplete: (context, event: { isResetPasswordComplete: boolean }) => ({
            ...context,
            isResetPasswordComplete: event.isResetPasswordComplete
        }),
        setIsSignedIn: (context, event: { isSignedIn: boolean }) => ({
            ...context,
            isSignedIn: event.isSignedIn
        }),
    },
})