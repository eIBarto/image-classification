import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource'
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/list-classification-candidates";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const s3Client = new S3Client();

const imageFormats = env.MEDIA_IMAGE_FORMATS.split(',');
const imageSizes = env.MEDIA_IMAGE_SIZES.split(',').map(parseImageSize) as Array<ImageSize>;

export const handler: Schema["listClassificationCandidatesProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { classificationId, nextToken, limit, imageOptions } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  const { data: classification, errors: classificationErrors } = await client.models.Classification.get({
    id: classificationId,
  });

  if (classificationErrors) {
    throw new Error("Failed to get classification");
  }

  if (!classification) {
    throw new Error("Classification not found");
  }

  const { projectId, viewId } = classification;

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

    if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {
      throw new Error("Unauthorized");
    }
  }

  const results = new Array<Schema["ResultProxy1"]["type"]>();
  let token: string | null | undefined = null;

  do {
    const { data, errors: resultsErrors, nextToken: newNextToken } = await client.models.Result.listResultsByClassificationId({
      classificationId: classificationId,
    }, {
      nextToken: token,
      selectionSet: ["id", "classificationId", "confidence", "fileId", "labelId", "createdAt", "updatedAt", "file.*", "label.*"]
    });

    if (resultsErrors) {
      throw new Error("Failed to get results");
    }

    if (!data) {
      throw new Error("Results not found");
    }

    results.push(...data);
    token = newNextToken as string | null | undefined;
  } while (token);

  const { data: viewFiles, errors: viewFilesErrors, ...rest } = await client.models.ViewFile.list({
    viewId: viewId,
    nextToken: nextToken,
    limit: limit || undefined,
    selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "view.*", "file.*"]
  });

  if (viewFilesErrors) {
    throw new Error("Failed to get files");
  }

  const { width, height, format } = imageOptions;

  if (!imageFormats.includes(format)) {
    throw new Error(`Unsupported image format: ${format}`);
  }

  if (!imageSizes.some((size) => size.width === width && size.height === height)) {
    throw new Error(`Unsupported image size: ${width}x${height}`);
  }

  const signedUrls = await Promise.all(viewFiles.map(async (viewFile) => await getUrl(env.MEDIA_BUCKET_BUCKET_NAME, `${viewFile.file.path}/${format}/${width}x${height}/${viewFile.file.name}`, parseInt(env.SIGNED_URL_EXPIRATION ?? '', 10))));

  const candidates = viewFiles.map((viewFile, index) => {
    const result = results.find((result) => result.fileId === viewFile.fileId);

    return {
      classificationId,
      fileId: viewFile.fileId,
      file: { ...viewFile.file, resource: signedUrls[index] },
      status: "READY" as Schema["ClassificationStatusProxy"]["type"],
      result: result,
      resultId: result?.id
    };
  });

  return { items: candidates, ...rest };
};

function getUrl(bucket: string, key: string, expiresIn: number) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
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
