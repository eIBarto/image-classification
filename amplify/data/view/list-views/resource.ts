import { defineFunction } from '@aws-amplify/backend';

export const listViews = defineFunction({
    name: 'list-views',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});