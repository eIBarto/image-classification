import { defineFunction } from '@aws-amplify/backend';

export const createProjectMembership = defineFunction({
    name: 'create-project-membership',
    resourceGroupName: 'data',
});