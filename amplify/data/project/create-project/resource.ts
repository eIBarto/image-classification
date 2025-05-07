import { defineFunction } from '@aws-amplify/backend';

export const createProject = defineFunction({
    name: 'create-project',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});