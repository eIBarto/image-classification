import { defineFunction } from '@aws-amplify/backend';

export const deleteProjectFile = defineFunction({
    name: 'delete-project-file',
    resourceGroupName: 'storage',
    timeoutSeconds: 10,
});