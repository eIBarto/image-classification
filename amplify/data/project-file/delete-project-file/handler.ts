import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/delete-project-file";
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const s3Client = new S3Client();


export const handler: Schema["deleteProjectFileProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, fileId } = event.arguments;

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

    if (projectMembership.access !== "MANAGE" && projectMembership.access !== "VIEW") { // todo consider view access
      throw new Error("Unauthorized");
    }
  }

  const { data: projectFile, errors: projectFileErrors } = await client.models.ProjectFile.delete({
    projectId: projectId,
    fileId: fileId,
  }, {
    selectionSet: ["projectId", "fileId", "createdAt", "updatedAt", "project.*", "file.*"]
  });

  if (projectFileErrors) {
    throw new Error("Failed to delete file");
  }

  if (!projectFile) { // optional
    throw new Error("File not found");
  }

  const { data: projectFiles, errors: projectFilesErrors } = await client.models.ProjectFile.listByFileId({
    fileId: fileId,
  });

  if (projectFilesErrors) {
    throw new Error("Failed to get project files");
  }

  if (projectFiles.length < 1) {
    const { data: file, errors: fileErrors } = await client.models.File.delete({
      id: fileId,
    }, {
      selectionSet: ["name", "path", "createdAt", "updatedAt", "authorId", "owner", "projects.*", "author.*"]
    });  // todo may append data back to return value

    if (fileErrors) {
      throw new Error("Failed to delete file");
    }

    if (!file) { // optional
      throw new Error("File not found");
    }

    let continuationToken: string | undefined;
    let isTruncated = false;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
        Prefix: `${file.path}/`, //todo ensure file.path ends with /?
        ContinuationToken: continuationToken,
      });

      const { Contents, NextContinuationToken, IsTruncated } = await s3Client.send(listCommand);

      if (Contents && Contents.length > 0) {
        console.log(`Deleting ${Contents.length} objects in batch`);

        const result = await s3Client.send(new DeleteObjectsCommand({
          Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
          Delete: { Objects: Contents.map(({ Key }) => ({ Key })) }
        }));

        if (result.Errors && result.Errors.length > 0) {
          console.error("Error deleting some objects:", result.Errors);
          throw new Error(`Error deleting some objects: ${result.Errors.map(e => e.Key).join(", ")}`);
        }
      }
      else {
        console.log("No objects to delete");
        throw new Error("No objects to delete");
      }

      continuationToken = NextContinuationToken;
      isTruncated = !!IsTruncated && !!continuationToken;
    } while (isTruncated);
  }

  return projectFile;
};

