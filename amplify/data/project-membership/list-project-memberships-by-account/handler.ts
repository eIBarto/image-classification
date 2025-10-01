import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-project-memberships-by-account";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listProjectMembershipsByAccountProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { nextToken, limit } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  console.log("groups", groups)

  const { data, errors, ...rest } = await client.models.ProjectMembership.list({
    accountId: sub,

    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["accountId", "projectId", "access", "createdAt", "updatedAt", "user.*", "project.*"]
  });

  if (errors) {
    throw new Error("Failed to get project memberships");
  }

  return { items: data, ...rest };
};