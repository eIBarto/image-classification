import { defineFunction } from '@aws-amplify/backend';

export const listPromptVersions = defineFunction({
    name: 'list-prompt-versions',
    resourceGroupName: 'data',
});