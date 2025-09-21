import { defineFunction, secret } from '@aws-amplify/backend';

export const classifyCandidates = defineFunction({
    name: 'classify-candidates',
    resourceGroupName: 'storage',
    timeoutSeconds: 60 * 5,
    environment: {
        GEMINI_API_KEY: secret("GEMINI_API_KEY"),
        MEDIA_IMAGE_SIZE: "1024x1024",
        MEDIA_IMAGE_FORMAT: "webp",

        GEMINI_MODEL_NAME: "gemini-2.0-flash",
    },
});