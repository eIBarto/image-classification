import { defineFunction } from '@aws-amplify/backend';

export const evaluationWrangler = defineFunction({
    name: 'evaluation-wrangler',
    timeoutSeconds: 60,
    memoryMB: 1024,
    //resourceGroupName: 'data',
});