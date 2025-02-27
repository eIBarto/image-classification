import { defineFunction } from '@aws-amplify/backend';

export const deleteProjectMembership = defineFunction({
    name: 'delete-project-membership',
    resourceGroupName: 'data',
});