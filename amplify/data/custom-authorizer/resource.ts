import { defineFunction } from '@aws-amplify/backend';

export const customAuthorizer = defineFunction({
    name: 'custom-authorizer',
    resourceGroupName: 'data', // todo check if storage is required for env transfer
    timeoutSeconds: 10,
});