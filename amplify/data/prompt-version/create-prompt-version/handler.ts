import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { randomUUID } from 'crypto';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-prompt-version";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createPromptVersionProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, promptId, text, labels } = event.arguments;

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

  const version = randomUUID();

  const { data: promptVersion, errors } = await client.models.PromptVersion.create({
    promptId: promptId,
    version: version,
    text: text,
  }, { selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt"] });

   if (errors) {
    throw new Error(`Failed to create prompt version`);
  }

  if (!promptVersion) {
    throw new Error("Failed to create prompt version");
  }

  for (const labelId of labels) {

    const { data: label, errors } = await client.models.PromptVersionLabel.create({
      promptId: promptId,
      version: version,
      labelId: labelId,
    });

    if (errors) {
      throw new Error("Failed to create label");
    }

    if (!label) {
      throw new Error("Failed to create label");
    }
  }

  return promptVersion;
};

