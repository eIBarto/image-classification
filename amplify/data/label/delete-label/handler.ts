import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-label";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deleteLabelProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, id } = event.arguments;

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

  // todo also delete all related entities

  const { data, errors } = await client.models.Label.delete({
    id: id,
  }, { selectionSet: ["id", "name", "description", /*"promptId",*/ "createdAt", "updatedAt"] });

  if (errors) {
    throw new Error("Failed to remove label");
  }

  if (!data) {
    throw new Error("Failed to remove label");
  }

  return data;
};



