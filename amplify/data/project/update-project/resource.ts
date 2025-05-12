import { defineFunction } from '@aws-amplify/backend';

export const updateProject = defineFunction({
    name: 'update-project',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});