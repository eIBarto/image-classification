import { defineFunction, secret } from '@aws-amplify/backend';

export const classifyClassification = defineFunction({
    name: 'classify-classification',
    resourceGroupName: 'storage',
    timeoutSeconds: 60 * 10,
    environment: {
        GEMINI_API_KEY: secret("GEMINI_API_KEY"),
        MEDIA_IMAGE_SIZE: "1024x1024",
        MEDIA_IMAGE_FORMAT: "webp",
        //MEDIA_IMAGE_QUALITY: "80",
        GEMINI_MODEL_NAME: "gemini-2.0-flash",
    },
});