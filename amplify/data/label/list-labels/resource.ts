import { defineFunction } from '@aws-amplify/backend';

export const listLabels = defineFunction({
    name: 'list-labels',
    resourceGroupName: 'data',
});