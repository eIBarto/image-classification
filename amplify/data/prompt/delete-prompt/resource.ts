import { defineFunction } from '@aws-amplify/backend';

export const deletePrompt = defineFunction({
    name: 'delete-prompt',
    resourceGroupName: 'data',
    timeoutSeconds: 10,
});