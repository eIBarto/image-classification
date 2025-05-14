import { defineFunction } from '@aws-amplify/backend';

export const onUpload = defineFunction({
    runtime: 20,
    name: 'on-upload',
    resourceGroupName: 'storage',
    timeoutSeconds: 10,
    //memoryMB: 1024,
    environment: {
        MEDIA_IMAGE_SIZES: "64x64,1024x1024",
        MEDIA_IMAGE_FORMATS: "webp",
        MEDIA_IMAGE_QUALITY: "80",
    },
});