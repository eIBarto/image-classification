import { defineFunction } from '@aws-amplify/backend';

export const setViewFileLabel = defineFunction({
    name: 'set-view-file-label',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});