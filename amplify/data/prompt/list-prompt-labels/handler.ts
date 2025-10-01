import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-prompt-labels";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listPromptLabelsProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, promptId, nextToken, limit } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  console.log("groups", groups)

  const isAdmin = groups?.includes("admin");

  if (!isAdmin) {
    const { data: projectMembership, errors } = await client.models.ProjectMembership.get({
      accountId: sub,
      projectId: projectId,
    });

    if (errors) {
      throw new Error("Failed to get project membership");
    }

    if (!projectMembership) {
      throw new Error("Unauthorized");
    }

    if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {
      throw new Error("Unauthorized");
    }
  }

  const { data: promptLabels, errors: promptLabelsErrors, ...rest } = await client.models.PromptLabel.list({
    promptId: promptId,
    selectionSet: ['promptId', 'labelId', 'label.*'],
    nextToken: nextToken,
    limit: limit ?? undefined,
  });

  if (promptLabelsErrors) {
    throw new Error("Failed to get prompt labels");
  }

  if (!promptLabels) {
    throw new Error("Prompt labels not found");
  }

  return { items: promptLabels.map(promptLabel => promptLabel.label), ...rest };
};