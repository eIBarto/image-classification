import { defineFunction } from '@aws-amplify/backend';

export const updateClassification = defineFunction({
    name: 'update-classification',
    resourceGroupName: 'data',
});