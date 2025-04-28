import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-project";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createProjectProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { name, description } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized missing identity");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized missing sub");
  }

  if (!groups?.includes("admin")) {
    throw new Error("Unauthorized");
  }

  const { data: project, errors } = await client.models.Project.create({
    name: name,
    description: description,
  }, { selectionSet: ["id", "name", "description", "createdAt", "updatedAt"] });

  if (errors) {
    throw new Error("Failed to create project");
  }

  if (!project) {
    throw new Error("Failed to create project");
  }

  const { data: projectMembership, errors: projectMembershipErrors } = await client.models.ProjectMembership.create({
    accountId: sub,
    projectId: project.id,
    access: "MANAGE",
  }, { selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*"] }); // todo resolve "project"

  if (projectMembershipErrors) {
    throw new Error(`Failed to create project membership: ${JSON.stringify(projectMembershipErrors, null, 2)}`);
  }

  if (!projectMembership) {
    throw new Error(`Failed to create project memberships`);
  }

  return { ...projectMembership, project };
};
