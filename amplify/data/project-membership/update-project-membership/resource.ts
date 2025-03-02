import { defineFunction } from '@aws-amplify/backend';

export const updateProjectMembership = defineFunction({
    name: 'update-project-membership',
    resourceGroupName: 'data',
});