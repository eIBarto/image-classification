import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-prompt-versions";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
// todo return all projects for admins
export const handler: Schema["listPromptVersionsProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, promptId, nextToken, limit } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  // todo return all projects for admins


  console.log("groups", groups)

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

    if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {// || !projectMembership.access.includes("MANAGE")) { // todo may  MANAGE
      throw new Error("Unauthorized");
    }
  }

  const { data, errors, ...rest } = await client.models.PromptVersion.listPromptVersionsByPromptId({
    promptId: promptId,
  }, {
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt", "labels.*"]//, ]//, "access", "user.*", "project.*"],
  });

  if (errors) {
    throw new Error("Failed to get prompt versions");
  }

  const { data: labelRelations, errors: labelRelationsErrors } = await client.models.PromptVersionLabel.list({
    promptId: promptId,
    //filter: {
    //  promptId: { eq: promptId }
    //},
    selectionSet: ['promptId', 'version', 'labelId', 'label.*']
  });

  if (labelRelationsErrors) {
    throw new Error("Failed to get label relations");
  }

  const labels = labelRelations.map(labelRelation => labelRelation.label);

  return { items: data.map(item => ({ ...item, labels: item.labels.flatMap(({ labelId }) => labels.find(label => label.id === labelId) ?? []) })), ...rest };
};