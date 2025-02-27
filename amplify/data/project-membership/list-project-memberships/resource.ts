import { defineFunction } from '@aws-amplify/backend';

export const listProjectMemberships = defineFunction({
    name: 'list-project-memberships',
    resourceGroupName: 'data',
});