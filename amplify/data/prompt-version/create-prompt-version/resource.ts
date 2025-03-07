import { defineFunction } from '@aws-amplify/backend';

export const createPromptVersion = defineFunction({
    name: 'create-prompt-version',
    resourceGroupName: 'data',
});