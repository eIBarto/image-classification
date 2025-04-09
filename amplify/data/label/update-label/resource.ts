import { defineFunction } from '@aws-amplify/backend';

export const updateLabel = defineFunction({
    name: 'update-label',
    resourceGroupName: 'data',
});