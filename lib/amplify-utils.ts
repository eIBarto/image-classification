/**
 * Server-side Amplify helpers for Next.js (App Router)
 * - Provides cookie/req-res based clients and common auth helpers
 * - Best practice: call these only in server contexts
 */
import { cookies } from 'next/headers';

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { generateServerClientUsingReqRes } from '@aws-amplify/adapter-nextjs/data';
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from "aws-amplify/auth/server";

import { type Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

export const cookiesClient = generateServerClientUsingCookies<Schema>({
    config: outputs,
    cookies,
});

export const { runWithAmplifyServerContext } = createServerRunner({
    config: outputs,
});

export const requestResponseClient = generateServerClientUsingReqRes<Schema>({
    config: outputs,
});

/** Get current Cognito user using server cookies */
export async function getCurrentUserFromCookies() {
    return await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => getCurrentUser(contextSpec),
    });
}

/** Fetch user attributes via server cookies */
export async function fetchUserAttributesFromCookies() {
    return await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });
}

/** Fetch auth session via server cookies */
export async function fetchAuthSessionFromCookies() {
    return await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => fetchAuthSession(contextSpec),
    });
}