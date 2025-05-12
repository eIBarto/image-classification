import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/update-prompt-version";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["updatePromptVersionProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, promptId, version, text } = event.arguments;

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

  const { data, errors } = await client.models.PromptVersion.update({ // todo may needs to pass null instead of undefined to ignore fields
    promptId: promptId,
    version: version,
    text: text || undefined,
  }, { selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt", "labels.*"] }); // todo add project to selection set or change handler

  if (errors) {
    throw new Error("Failed to update prompt version");
  }

  if (!data) {
    throw new Error("Failed to update prompt version");
  }

  const { data: labelRelations, errors: labelRelationsErrors } = await client.models.PromptVersionLabel.list({
    promptId: promptId,
    filter: {
      version: { eq: version }
    },
    //version: 
    selectionSet: ['promptId', 'version', 'labelId', 'label.*']
  });

  if (labelRelationsErrors) {
    throw new Error("Failed to get label relations");
  }

  const labels = labelRelations.map(labelRelation => labelRelation.label);

  return { ...data, labels }; // todo direkt returnen?
};



