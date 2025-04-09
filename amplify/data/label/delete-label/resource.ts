import { defineFunction } from '@aws-amplify/backend';

export const deleteLabel = defineFunction({
    name: 'delete-label',
    resourceGroupName: 'data',
});