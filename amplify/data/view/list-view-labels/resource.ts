import { defineFunction } from '@aws-amplify/backend';

export const listViewLabels = defineFunction({
    name: 'list-view-labels',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});