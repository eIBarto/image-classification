import { defineFunction } from '@aws-amplify/backend';

export const listProjects = defineFunction({
    name: 'list-projects',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});