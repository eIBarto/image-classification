import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-view-labels";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
// todo return all projects for admins
export const handler: Schema["listViewLabelsProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, viewId, nextToken, limit } = event.arguments;

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

  /*const { data: labelRelations, errors: labelRelationsErrors, ...rest } = await client.models.PromptVersionLabel.list({
    promptId: promptId,
    //version: 
    selectionSet: ['promptId', 'version', 'labelId', 'label.*'],
    nextToken: nextToken,
    limit: limit ?? undefined,
  });

  if (labelRelationsErrors) {
    throw new Error("Failed to get label relations");
  }

  const labels = labelRelations.map(labelRelation => labelRelation.label);
*/

  const { data: viewLabels, errors: viewLabelsErrors, ...rest } = await client.models.ViewLabel.list({
    viewId: viewId,
    selectionSet: ['viewId', 'labelId', 'label.*'],
    nextToken: nextToken,
    limit: limit ?? undefined,
  });

  if (viewLabelsErrors) {
    throw new Error("Failed to get view labels");
  }

  if (!viewLabels) {
    throw new Error("View labels not found");
  }

  return { items: viewLabels.map(viewLabel => viewLabel.label), ...rest };
};