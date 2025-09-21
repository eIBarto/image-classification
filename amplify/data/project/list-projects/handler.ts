import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-projects";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listProjectsProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { nextToken, limit } = event.arguments;

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
    const { data: projectMemberships, errors, ...rest } = await client.models.ProjectMembership.listProjectMembershipsByAccountId({
      accountId: sub,
    },
      {
        nextToken: nextToken,
        limit: limit || undefined,
        selectionSet: ["project.*", "updatedAt", "createdAt", "accountId", "projectId", "access"],
      }
    );

    if (errors) {
      throw new Error("Failed to get project memberships");
    }

    return { items: projectMemberships, ...rest };
  }

  const { data: projects, errors, ...rest } = await client.models.Project.list({
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["id", "name", "description",  "createdAt", "updatedAt"]
  });

  if (errors) {
    throw new Error("Failed to get projects");
  }

  return { items: projects.map((project) => ({ projectId: project.id, updatedAt: project.updatedAt, createdAt: project.createdAt, accountId: sub, project: project, access: "VIEW" })), ...rest };
};