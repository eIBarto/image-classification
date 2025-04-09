import { defineFunction } from '@aws-amplify/backend';

export const createLabel = defineFunction({
    name: 'create-label',
    resourceGroupName: 'data',
});