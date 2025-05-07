import { defineFunction } from '@aws-amplify/backend';

export const listProjectMembershipsByProject = defineFunction({
    name: 'list-project-memberships-by-project',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});