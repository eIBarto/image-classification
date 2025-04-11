import { defineFunction } from '@aws-amplify/backend';

export const listPromptLabels = defineFunction({
    name: 'list-prompt-labels',
    resourceGroupName: 'data',
});