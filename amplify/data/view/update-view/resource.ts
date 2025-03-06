import { defineFunction } from '@aws-amplify/backend';

export const updateView = defineFunction({
    name: 'update-view',
    resourceGroupName: 'data',
});