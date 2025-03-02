import { defineFunction } from '@aws-amplify/backend';

export const updateProjectFile = defineFunction({
    name: 'update-project-file',
    resourceGroupName: 'storage',
});