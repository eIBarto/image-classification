import { defineFunction } from '@aws-amplify/backend';

export const listPrompts = defineFunction({
    name: 'list-prompts',
    resourceGroupName: 'data',
});