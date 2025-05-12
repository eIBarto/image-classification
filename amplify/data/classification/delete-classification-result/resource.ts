import { defineFunction } from '@aws-amplify/backend';

export const deleteClassificationResult = defineFunction({
    name: 'delete-classification-result',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});