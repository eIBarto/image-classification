import { defineFunction } from '@aws-amplify/backend';

export const createPrompt = defineFunction({
    name: 'create-prompt',
    resourceGroupName: 'data',
});