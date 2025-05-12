import { defineFunction } from '@aws-amplify/backend';

export const listClassifications = defineFunction({
    name: 'list-classifications',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});