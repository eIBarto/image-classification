import { defineFunction } from '@aws-amplify/backend';

export const deleteViewFile = defineFunction({
    name: 'delete-view-file',
    resourceGroupName: 'storage',
});