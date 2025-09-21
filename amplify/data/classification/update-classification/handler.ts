import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/update-classification";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["updateClassificationProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, id, name, description } = event.arguments;

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

    if (projectMembership.access !== "MANAGE") {
      throw new Error("Unauthorized");
    }
  }

  const { data, errors } = await client.models.Classification.update({
    id: id,
    name: name || undefined,
    description: description || undefined,
  }, { selectionSet: ["id", "projectId", "viewId", "promptId", "version", "name", "description", "createdAt", "updatedAt", "results.*", "model", "temperature", "topP", "maxLength"] });

  if (errors) {
    throw new Error("Failed to update classification");
  }

  if (!data) {
    throw new Error("Failed to update classification");
  }

  return { ...data };
};

