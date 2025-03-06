import { defineFunction } from '@aws-amplify/backend';

export const createView = defineFunction({
    name: 'create-view',
    resourceGroupName: 'data',
});