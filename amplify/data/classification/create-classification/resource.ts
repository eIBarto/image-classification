import { defineFunction } from '@aws-amplify/backend';

export const createClassification = defineFunction({
    name: 'create-classification',
    resourceGroupName: 'data',
});