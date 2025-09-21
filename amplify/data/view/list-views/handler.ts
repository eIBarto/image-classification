import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-views";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listViewsProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, nextToken, query, limit } = event.arguments;

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

  const filter = query ? {
    or: [
      {
        name: { contains: query.toLowerCase() }
      },
      {
        name: { contains: query.toUpperCase() }
      }
    ]
  } : undefined;

  const { data, errors, ...rest } = await client.models.View.listViewsByProjectId({
    projectId: projectId,
  }, {
    filter: filter,
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["id", "name", "description", "projectId", "createdAt", "updatedAt", "project.*", "files.*"]
  });

  if (errors) {
    throw new Error("Failed to get views");
  }

  return { items: data, ...rest };
};