import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-users";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["listUsersProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { nextToken, limit, query } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  const isAdmin = groups?.includes("admin");

  if (!isAdmin) {
    const { data: projectMemberships, errors } = await client.models.ProjectMembership.list({
      accountId: sub,
      filter: {
        and: [
          {
            access: {
              eq: "MANAGE",
            },
          },
        ],
      },

    });

    if (errors) {
      throw new Error("Failed to get project membership");
    }

    if (!projectMemberships.length) {
      throw new Error("Unauthorized");
    }
  }

  const { data, errors, ...rest } = await client.models.User.list({

    filter: query ? {
      email: {
        contains: query,
      },
    } : undefined,
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["accountId", "email", "owner", "createdAt", "updatedAt"]
  });

  if (errors) {
    throw new Error("Failed to get users");
  }

  return { items: data, ...rest };
};