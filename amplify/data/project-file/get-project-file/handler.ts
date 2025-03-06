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

const imageFormats = env.MEDIA_IMAGE_FORMATS.split(',');
const imageSizes = env.MEDIA_IMAGE_SIZES.split(',').map(parseImageSize) as Array<ImageSize>;

export const handler: Schema["getProjectFileProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, fileId, imageOptions } = event.arguments;

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

  const { data: projectFile, errors } = await client.models.ProjectFile.get({
    projectId: projectId,
    fileId: fileId,
  },{
    selectionSet: ["projectId", "fileId", "createdAt", "updatedAt", "project.*", "file.*"]//, ]//, "access", "user.*", "project.*"],
  });

  if (errors) {
    throw new Error("Failed to get files");
  }

  if (!projectFile) {
    throw new Error("File not found");
  }

  const { width, height, format } = imageOptions;

  if (!imageFormats.includes(format)) {
    throw new Error(`Unsupported image format: ${format}`);
  }

  if (!imageSizes.some((size) => size.width === width && size.height === height)) {
    throw new Error(`Unsupported image size: ${width}x${height}`);
  }

  const { file } = projectFile;
  const path = `${file.path}/${format}/${width}x${height}/${file.name}`;

  const command = new GetObjectCommand({
    Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
    Key: path,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: parseInt(env.SIGNED_URL_EXPIRATION ?? '', 10) });
  return { ...projectFile, file: { ...file, resource: signedUrl } };
};


type ImageSize = {
  width: number;
  height: number;
}

function parseImageSize(text: string): ImageSize {
  const match = text.match(/(?<width>\d+)x(?<height>\d+)/);
  if (!match) {
      throw new Error("Invalid image dimensions");
  }

  const width = match.groups?.width;
  if (!width) {
      throw new Error("Missing width");
  }

  const height = match.groups?.height;
  if (!height) {
      throw new Error("Missing height");
  }

  return {
      width: parseInt(width),
      height: parseInt(height),
  };
}
