import { defineFunction } from '@aws-amplify/backend';

export const deleteClassification = defineFunction({
    name: 'delete-classification',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});