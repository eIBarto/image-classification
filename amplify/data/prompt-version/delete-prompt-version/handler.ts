import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-prompt-version";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deletePromptVersionProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, promptId, version } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

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

    if (projectMembership.access !== "MANAGE" && projectMembership.access !== "VIEW") {
      throw new Error("Unauthorized");
    }
  }

  // todo also delete all versions 

  const { data, errors } = await client.models.PromptVersion.delete({
    promptId: promptId,
    version: version,
  }, { selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt", "labels.*"] });

  if (errors) {
    throw new Error("Failed to remove prompt version");
  }

  if (!data) {
    throw new Error("Failed to remove prompt version");
  }

  const { labels, ...rest } = data;

  for (const { labelId } of labels) {
    const { data, errors } = await client.models.PromptVersionLabel.delete({
      promptId: promptId,
      version: version,
      labelId: labelId,
    });

    if (errors) {
      throw new Error("Failed to delete prompt version label");
    }

    if (!data) {
      throw new Error("Failed to delete prompt version label");
    }
  }

  return rest;
};



