import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "$amplify/env/get-project-file";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const s3Client = new S3Client();

export const handler: Schema["updateProjectFileProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, fileId, name } = event.arguments;

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

    if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {// || !projectMembership.access.includes("MANAGE")) { // todo may  MANAGE
      throw new Error("Unauthorized");
    }
  }

  const { data: file, errors } = await client.models.File.update({
    id: fileId,
    name: name,
  },{
    selectionSet: ["id", "name", "path", "createdAt", "updatedAt", "author.*"]//, ]//, "access", "user.*", "project.*"],
  });

 /* const { data, errors, ...rest } = await client.models.ProjectFile.listProjectFileBySize({
    size: size,
  }, {
    nextToken: nextToken,
    filter: {
      projectId: { eq: projectId },
    },
    limit: limit || undefined,
    selectionSet: ["id", "projectId", "fileId", "createdAt", "updatedAt", "project.*", "file.*", "size"]//, ]//, "access", "user.*", "project.*"],
  });
*/
  if (errors) {
    throw new Error("Failed to get files");
  }

  if (!file) {
    throw new Error("File not found");
  }

  return file
};
