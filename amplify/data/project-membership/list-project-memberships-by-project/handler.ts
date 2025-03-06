import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-project-memberships-by-project";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listProjectMembershipsByProjectProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, nextToken, limit } = event.arguments;

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

    if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {// || !projectMembership.access.includes("MANAGE")) { // todo may  MANAGE
      throw new Error("Unauthorized");
    }
  }

  const { data, errors, ...rest } = await client.models.ProjectMembership.listProjectMembershipsByProjectId({
    projectId: projectId,
  }, {
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*", "project.*"]//, ]//, "access", "user.*", "project.*"],
  });

  if (errors) {
    throw new Error("Failed to get project memberships");
  }

  return { items: data, ...rest };
};