import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-classification";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createClassificationProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, viewId, promptId, version, name, description, model = "GEMINI_2", temperature, topP, maxLength } = event.arguments;

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

  const { data: classification, errors } = await client.models.Classification.create({
    projectId: projectId,
    viewId: viewId,
    promptId: promptId,
    version: version,
    name: name,
    description: description,
    model: model,
    temperature: temperature,
    topP: topP,
    maxLength: maxLength,
  }, { selectionSet: ["id", "projectId", "viewId", "promptId", "version", "name", "description", "createdAt", "updatedAt", "model", "temperature", "topP", "maxLength"] });

  if (errors) {
    throw new Error("Failed to create classification");
  }

  if (!classification) {
    throw new Error("Failed to create classification");
  }

  return { ...classification, results: [] };
};

