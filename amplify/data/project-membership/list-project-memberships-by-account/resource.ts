import { defineFunction } from '@aws-amplify/backend';

export const listProjectMembershipsByAccount = defineFunction({
    name: 'list-project-memberships-by-account',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});