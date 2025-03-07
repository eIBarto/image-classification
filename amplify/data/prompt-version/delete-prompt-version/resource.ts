import { defineFunction } from '@aws-amplify/backend';

export const deletePromptVersion = defineFunction({
    name: 'delete-prompt-version',
    resourceGroupName: 'data',
});