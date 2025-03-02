import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import type { Schema as ProjectSchema } from '../schema';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/update-project-membership";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: ProjectSchema["updateProjectMembershipProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, accountId, access } = event.arguments;

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
      accountId: accountId,
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

  const { data: project, errors: projectErrors } = await client.models.Project.get({
    id: projectId,
  }, { selectionSet: ["id", "name", "description", "createdAt", "updatedAt"] });

  if (projectErrors) {
    throw new Error("Failed to get project");
  }

  if (!project) {
    throw new Error("Project not found");
  }

  const { data, errors } = await client.models.ProjectMembership.update({
    accountId: accountId,
    projectId: projectId,
    access: access,
  }, { selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*"] }); // todo add project to selection set or change handler

  if (errors) {
    throw new Error("Failed to update project membership");
  }

  if (!data) {
    throw new Error("Failed to update project membership");
  }

  return { ...data, project }; // todo direkt returnen?
};



