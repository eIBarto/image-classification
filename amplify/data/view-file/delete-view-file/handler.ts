import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-view-file";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deleteViewFileProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, viewId, fileId } = event.arguments;

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

    if (projectMembership.access !== "MANAGE" && projectMembership.access !== "VIEW") { // todo consider view access
      throw new Error("Unauthorized");
    }
  }

  /*const { data: project, errors: projectErrors } = await client.models.Project.get({
    id: projectId,
  }, { selectionSet: ["id", "name", "description", "createdAt", "updatedAt"] });

  if (projectErrors) {
    throw new Error("Failed to get project");
  }

  if (!project) {
    throw new Error("Project not found");
  }*/

  // todo ensure the project membership is referenced to ViewFile, maybe add projectId to table
  const { data, errors } = await client.models.ViewFile.delete({
    viewId: viewId,
    fileId: fileId,
  }, { selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "view.*", "file.*", "label.*", "labelId"] }); // todo add project to selection set

  if (errors) {
    throw new Error("Failed to remove view file");
  }

  if (!data) {
    throw new Error("Failed to remove view file");
  }

  return data;// { ...data, file: null, view: null };
};

