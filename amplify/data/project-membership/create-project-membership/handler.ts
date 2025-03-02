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

  const { data: project, errors: projectErrors } = await client.models.Project.get({
    id: projectId,
  }, { selectionSet: ["id", "name", "description", "createdAt", "updatedAt"] });

  if (projectErrors) {
    throw new Error("Failed to get project");
  }

  if (!project) {
    throw new Error("Project not found");
  }

  const { data: projectMembership, errors } = await client.models.ProjectMembership.create({
    accountId: accountId,
    projectId: projectId,
    access: "VIEW",
  }, { selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*"]}); // todo add project to selection set

  if (errors) {
    throw new Error("Failed to create project membership");
  }

  if (!projectMembership) {
    throw new Error("Failed to create project membership");
  }

  return { ...projectMembership, project };
};


//Failed to create project membership: [{"path":["createProjectMembership","project","id"],"locations":null,"message":"Cannot return null for non-nullable type: 'ID' within parent 'Project' (/createProjectMembership/project/id)"},{"path":["createProjectMembership","project","name"],"locations":null,"message":"Cannot return null for non-nullable type: 'String' within parent 'Project' (/createProjectMembership/project/name)"},{"path":["createProjectMembership","project","createdAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/createdAt)"},{"path":["createProjectMembership","project","updatedAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/updatedAt)"}]