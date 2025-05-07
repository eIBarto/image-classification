import { defineFunction } from '@aws-amplify/backend';

export const evaluationWrangler = defineFunction({
    name: 'evaluation-wrangler',
    timeoutSeconds: 10
    //resourceGroupName: 'data',
});