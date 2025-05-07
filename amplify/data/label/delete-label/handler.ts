import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-label";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deleteLabelProxy"]["functionHandler"] = async (event) => {
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

  // todo also delete all related entities

  const { data, errors } = await client.models.Label.delete({
    id: id,
  }, { selectionSet: ["id", "name", "description", /*"promptId",*/ "createdAt", "updatedAt", "projectId", "prompts.*", "promptVersions.*", "views.*"] });

  if (errors) {
    throw new Error("Failed to remove label");
  }

  if (!data) {
    throw new Error("Failed to remove label");
  }

  for (const { promptId } of data.prompts) {
    const { data, errors } = await client.models.PromptLabel.delete({
      promptId: promptId,
      labelId: id,
    });

    if (errors) {
      throw new Error("Failed to delete prompt label");
    }

    if (!data) {
      throw new Error("Failed to delete prompt label");
    }
  }

  for (const { viewId } of data.views) {
    const { data, errors } = await client.models.ViewLabel.delete({
      viewId: viewId,
      labelId: id,
    });

    if (errors) {
      throw new Error("Failed to delete view label");
    }

    if (!data) {
      throw new Error("Failed to delete view label");
    }
  }

  for (const { promptId, version } of data.promptVersions) {
    const { data, errors } = await client.models.PromptVersionLabel.delete({
      promptId: promptId,
      version: version,
      labelId: id,
    });

    if (errors) {
      throw new Error("Failed to delete prompt version label");
    }

    if (!data) {
      throw new Error("Failed to delete prompt version label");
    }
  }



  //for (const { labelId } of data.promptVersions) {
  //  const { data, errors } = await client.models.PromptVersionLabel.delete({
  //    promptId: id,
  //    labelId: labelId,
  //  });
  //
  //  if (errors) {
  //    throw new Error("Failed to delete prompt label");
  //  }
  //
  //  if (!data) {
  //    throw new Error("Failed to delete prompt label");
  //  }
  //}


  return data;
};



