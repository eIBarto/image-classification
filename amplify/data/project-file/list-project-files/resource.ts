import { defineFunction } from '@aws-amplify/backend';

export const listProjectFiles = defineFunction({
    name: 'list-project-files',
    resourceGroupName: 'storage',
    environment: {
        SIGNED_URL_EXPIRATION: "3600",
        MEDIA_IMAGE_SIZES: "64x64,1024x1024",
        MEDIA_IMAGE_FORMATS: "webp",
    }
});