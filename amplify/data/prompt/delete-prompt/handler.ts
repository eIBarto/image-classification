import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-prompt";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deletePromptProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, id } = event.arguments;

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

  // todo also delete all versions 

  //const { data: promptVersions, errors: promptVersionsErrors } = await client.models.PromptVersion.list({
  //  promptId: id,
  //});
  //
  //if (promptVersionsErrors) {
  //  throw new Error("Failed to delete prompt versions");
  //}

  const { data: promptData, errors: promptErrors } = await client.models.Prompt.delete({
    id: id,
  }, { selectionSet: ["id", "summary", "description", "projectId", "createdAt", "updatedAt", "versions.*", "labels.*"] });

  if (promptErrors) {
    throw new Error("Failed to delete prompt");
  }

  if (!promptData) {
    throw new Error("Failed to delete prompt");
  }

  for (const { version } of promptData.versions) {
    const { data, errors } = await client.models.PromptVersion.delete({
      promptId: id,
      version: version,
    }, { selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt", "labels.*"] });

    if (errors) {
      throw new Error("Failed to delete prompt version");
    }

    if (!data) {
      throw new Error("Failed to delete prompt version");
    }

    for (const { labelId } of data.labels) {
      const { data, errors } = await client.models.PromptVersionLabel.delete({
        promptId: id,
        version: version,
        labelId: labelId,
      });

      if (errors) {
        throw new Error("Failed to delete prompt version label");
      }

      if (!data) {
        throw new Error("Failed to delete prompt version label");
      }
    }
  }
  for (const { labelId } of promptData.labels) {
    const { data, errors } = await client.models.PromptLabel.delete({
      promptId: id,
      labelId: labelId,
    });

    if (errors) {
      throw new Error("Failed to delete prompt label");
    }

    if (!data) {
      throw new Error("Failed to delete prompt label");
    }
  }

  // todo delete all labels currently they still have a strong reference to project and are usable but unassigned? 

  //const { data, errors } = await client.models.Prompt.delete({
  //  id: id,
  //}, { selectionSet: ["id", "summary", "description", "projectId", "createdAt", "updatedAt"] });
  //
  //if (errors) {
  //  throw new Error("Failed to remove prompt");
  //}
  //
  //if (!data) {
  //  throw new Error("Failed to remove prompt");
  //}

  return { ...promptData, project: null, files: [] };
};



