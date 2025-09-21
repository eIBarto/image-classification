import type { S3Handler } from 'aws-lambda';
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/on-upload";
import { randomUUID } from 'node:crypto';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

import sharp, { FormatEnum } from 'sharp';
const s3Client = new S3Client();

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const imageSizes = env.MEDIA_IMAGE_SIZES.split(',').map(parseImageSize) as Array<ImageSize>;
const imageFormats = env.MEDIA_IMAGE_FORMATS.split(',');
const imageQuality = parseInt(env.MEDIA_IMAGE_QUALITY);

export const handler: S3Handler = async (event) => {
    for (const record of event.Records) {
        const { key } = record.s3.object;

        const path = decodeURIComponent(key.replace(/\+/g, ' '));
        const pathComponents = path.split('/');

        try {
            if (pathComponents.length !== 6) {
                throw new Error(`Invalid path: ${pathComponents.length}`);
            }

            const [baseDirectory, submissionsDirectory, identityId, accountId, projectId, fileName] = pathComponents;

            if (baseDirectory !== "projects") {
                throw new Error(`Invalid base directory: ${baseDirectory}`);
            }

            if (submissionsDirectory !== "submissions") {
                throw new Error(`Invalid submissions directory: ${submissionsDirectory}`);
            }

            if (!accountId) {
                throw new Error(`Invalid accountId: ${accountId}`);
            }

            if (!identityId) {
                throw new Error(`Invalid identityId: ${identityId}`);
            }

            if (!projectId) {
                throw new Error(`Invalid projectId: ${projectId}`);
            }

            if (!fileName) {
                throw new Error(`Invalid fileName: ${fileName}`);
            }

            const { data: projectMembership, errors: projectMembershipErrors } = await client.models.ProjectMembership.get({
                accountId: accountId,
                projectId: projectId,
            });

            if (projectMembershipErrors) {
                throw new Error("Failed to get project membership");
            }

            if (!projectMembership) {
                throw new Error("Unauthorized");
            }

            if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {
                throw new Error("Unauthorized");
            }

            const { data: user, errors } = await client.models.User.get({ accountId });

            if (errors) {
                throw new Error("Failed to fetch user profile");
            }

            if (!user) {
                throw new Error("User profile not found");
            }

            const { owner } = user;

            const fileId = randomUUID();
            const filePath = `projects/shared/${projectId}/${fileId}`;

            for (const format of imageFormats) {
                for (const { width, height } of imageSizes) {

                    const storagePath = `${filePath}/${format}/${width}x${height}/${fileName}`;

                    const getObjectResponse = await s3Client.send(new GetObjectCommand({
                        Bucket: env.UPLOAD_MEDIA_BUCKET_BUCKET_NAME,
                        Key: path,
                    }));

                    const body = getObjectResponse.Body;
                    if (!body) {
                        throw new Error('Failed to read image data');
                    }

                    const imageData = await body.transformToByteArray();

                    const processedImage = await sharp(imageData).resize(width, height, { fit: 'inside', withoutEnlargement: true }).toFormat(format as keyof FormatEnum, { quality: imageQuality }).toBuffer();

                    await s3Client.send(new PutObjectCommand({
                        Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
                        Key: storagePath,
                        Body: processedImage,

                    }));

                }
            }

            const { data: file, errors: fileErrors } = await client.models.File.create({
                id: fileId,
                name: fileName,
                path: filePath,
                owner: owner,
            });

            if (fileErrors) {
                throw new Error("Failed to create file");
            }

            if (!file) {
                throw new Error("Failed to create file");
            }

            await client.models.ProjectFile.create({
                projectId: projectId,
                fileId: file.id,
            });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: env.UPLOAD_MEDIA_BUCKET_BUCKET_NAME,
                Key: path,
            }));
        }
    }
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
