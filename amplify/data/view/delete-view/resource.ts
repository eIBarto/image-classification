import { defineFunction } from '@aws-amplify/backend';

export const deleteView = defineFunction({
    name: 'delete-view',
    resourceGroupName: 'data',
    timeoutSeconds: 60,
});