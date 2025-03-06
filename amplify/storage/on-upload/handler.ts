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

const imageSizes = env.MEDIA_IMAGE_SIZES.split(',').map(parseImageSize) as Array<ImageSize>; // todo validate if best practice
const imageFormats = env.MEDIA_IMAGE_FORMATS.split(','); // todo validate if best practice
const imageQuality = parseInt(env.MEDIA_IMAGE_QUALITY); // todo validate if best practice

export const handler: S3Handler = async (event) => {
    for (const record of event.Records) {
        const { key } = record.s3.object;

        // todo ensure that user is part of project
        //const { principalId } = record.userIdentity; oder context.identity
        // todo check size limits
        const path = decodeURIComponent(key.replace(/\+/g, ' '));
        const pathComponents = path.split('/');

        try {
            if (pathComponents.length !== 6) {
                throw new Error(`Invalid path: ${pathComponents.length}`);
            }

            const [baseDirectory, submissionsDirectory, identityId, accountId, projectId, fileName] = pathComponents;
            // todo use either identityId or principalId if possible. Retrieve sub from cognito identity id

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

            const { data: projectMembership, errors: projectMembershipErrors } = await client.models.ProjectMembership.get({ // Notice only members are allowed to add files to a project, this is required even for admins since they cannot be verified from this scope
                accountId: accountId,
                projectId: projectId,
            });

            if (projectMembershipErrors) {
                throw new Error("Failed to get project membership");
            }

            if (!projectMembership) {
                throw new Error("Unauthorized");
            }

            if (projectMembership.access !== "VIEW" && projectMembership.access !== "MANAGE") {// || !projectMembership.access.includes("MANAGE")) { // todo may  MANAGE
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


            for (const format of imageFormats) { // todo make concurrent
                for (const { width, height } of imageSizes) {


                    const storagePath = `${filePath}/${format}/${width}x${height}/${fileName}`; // todo check doc for leading /

                    const getObjectResponse = await s3Client.send(new GetObjectCommand({
                        Bucket: env.UPLOAD_MEDIA_BUCKET_BUCKET_NAME,
                        Key: path,
                    }));

                    const body = getObjectResponse.Body;
                    if (!body) {
                        throw new Error('Failed to read image data');
                    }

                    const imageData = await body.transformToByteArray(); // use body directly?

                    const processedImage = await sharp(imageData).resize(width, height, { fit: 'inside', withoutEnlargement: true }).toFormat(format as keyof FormatEnum, { quality: imageQuality }).toBuffer();

                    await s3Client.send(new PutObjectCommand({
                        Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
                        Key: storagePath,
                        Body: processedImage,
                        //Metadata: {
                        //    Size: processedImage.length.toString(),
                        //    Etag: eTag,
                        //}
                        //ContentType: 'image/webp',
                    }));


                    //const { Size, Etag } = response.$metadata;

                    //size und etag //response.$metadata.size
                    // key ending replacen oder weglassen un content type?
                    // dann deleten
                }
            }

            const { data: file, errors: fileErrors } = await client.models.File.create({
                id: fileId,
                name: fileName,
                path: filePath, //`${destinationPath}-${JSON.stringify(response.$metadata)}`,
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
