import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-view";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createViewProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, name, description, files } = event.arguments;

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

  const { data: view, errors } = await client.models.View.create({
    name: name,
    description: description,
    projectId: projectId,
  }, { selectionSet: ["id", "name", "description", "projectId", "createdAt", "updatedAt"] });

  if (errors) {
    throw new Error("Failed to create view");
  }

  if (!view) {
    throw new Error("Failed to create view");
  }

  if (files) {
    for (const fileId of files) {
      const { data: viewFile, errors: viewFileErrors } = await client.models.ViewFile.create({
        viewId: view.id,
        fileId: fileId,
    }, { selectionSet: ["viewId", "fileId", "createdAt", "updatedAt"] });

    if (viewFileErrors) {
      throw new Error("Failed to create view files");
    }

    if (!viewFile) {
        throw new Error("Failed to create view files");
      }
    }
  }

  return { ...view, project: null, files: [] };
};

