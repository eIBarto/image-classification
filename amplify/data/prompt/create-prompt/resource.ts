import { defineFunction, secret } from '@aws-amplify/backend';

export const createPrompt = defineFunction({
    name: 'create-prompt',
    resourceGroupName: 'data',
    environment: {
        GEMINI_API_KEY: secret("GEMINI_API_KEY"),
        GEMINI_MODEL_NAME: "gemini-2.0-flash",
    },
});