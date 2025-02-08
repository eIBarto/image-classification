import { AuthGetCurrentUserServer } from "@/lib/amplify-utils";
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { z } from "zod";

class MyCustomError extends Error { }

export const actionClient = createSafeActionClient({
    // Can also be an async function.
    handleServerError(e) {
        // Log to console.
        console.error("Action error:", e.message);

        // In this case, we can use the 'MyCustomError` class to unmask errors
        // and return them with their actual messages to the client.
        if (e instanceof MyCustomError) {
            return e.message;
        }

        // Every other error that occurs will be masked with the default message.
        return DEFAULT_SERVER_ERROR_MESSAGE;
    },
    defineMetadataSchema() {
        return z.object({
            actionName: z.string(),
        });
    },
});


export const authActionClient = actionClient
    .use(async ({ next }) => {
        const user = await AuthGetCurrentUserServer()

        if (!user) {
            throw new Error("User not found!");
        }

        return next({ ctx: { user } }); // todo might just expose session.sub/accoundId
    });
