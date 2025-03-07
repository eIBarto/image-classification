import { defineFunction } from '@aws-amplify/backend';

export const updatePromptVersion = defineFunction({
    name: 'update-prompt-version',
    resourceGroupName: 'data',
});