import { defineFunction } from '@aws-amplify/backend';

export const updatePrompt = defineFunction({
    name: 'update-prompt',
    resourceGroupName: 'data',
});