import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import type { Schema as ProjectSchema } from '../schema';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-project-membership";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: ProjectSchema["createProjectMembershipProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, accountId } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  const isAdmin = groups?.includes("ADMINS");

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

  const { data: projectMembership, errors } = await client.models.ProjectMembership.create({
    accountId: accountId,
    projectId: projectId,
    access: "VIEW",
  }, { selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*", "project.*"]});

  if (errors) {
    throw new Error("Failed to create project membership");
  }

  return projectMembership;
};