import { defineFunction } from '@aws-amplify/backend';

export const deleteProject = defineFunction({
    name: 'delete-project',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});