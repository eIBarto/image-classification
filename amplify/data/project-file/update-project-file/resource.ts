import { defineFunction } from '@aws-amplify/backend';

export const updateProjectFile = defineFunction({
    name: 'update-project-file',
    resourceGroupName: 'storage',
    timeoutSeconds: 10,
    environment: {
        SIGNED_URL_EXPIRATION: "3600",
        MEDIA_IMAGE_SIZES: "64x64,1024x1024",
        MEDIA_IMAGE_FORMATS: "webp",
    }
});