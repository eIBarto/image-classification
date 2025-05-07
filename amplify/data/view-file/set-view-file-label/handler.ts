import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/set-view-file-label";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["setViewFileLabelProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, viewId, fileId, labelId } = event.arguments;

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

  const { data: viewFile, errors: viewFileErrors } = await client.models.ViewFile.get({
    viewId: viewId,
    fileId: fileId,
  }, { selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "view.*", "file.*", "label.*", "labelId"] });

  if (viewFileErrors) {
    throw new Error("Failed to get view file");
  }

  const { data, errors } = await client.models.ViewFile.update({ // todo may needs to pass null instead of undefined to ignore fields
    viewId: viewId,
    fileId: fileId,
    labelId: viewFile?.labelId === labelId ? null : labelId,
  }, { selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "view.*", "file.*", "label.*", "labelId"] }); // todo add project to selection set or change handler

  if (errors) {
    throw new Error("Failed to update view");
  }

  if (!data) {
    throw new Error("Failed to update view");
  }

  return { ...data }; // todo direkt returnen?
};

