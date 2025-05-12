import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { GoogleGenerativeAI, SchemaType, ArraySchema } from "@google/generative-ai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
//import sharp, { FormatEnum } from 'sharp';
import { env } from "$amplify/env/classify-classification";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const s3Client = new S3Client();
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const imageFormat = env.MEDIA_IMAGE_FORMAT;
const imageSize = parseImageSize(env.MEDIA_IMAGE_SIZE);
//const imageQuality = parseInt(env.MEDIA_IMAGE_QUALITY);

export const handler: Schema["classifyClassificationProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { classificationId } = event.arguments;

  if (!identity) {
    throw new Error("Unauthorized");
  }

  const { sub, groups } = identity as AppSyncIdentityCognito;

  if (!sub) {
    throw new Error("Unauthorized");
  }

  const { data: classification, errors: classificationErrors } = await client.models.Classification.get({
    id: classificationId,
  }, {
    selectionSet: ["projectId", "promptId", "version", "viewId",/*, "promptVersion.*"*/]
  });

  if (classificationErrors) {
    throw new Error("Failed to get classification");
  }

  if (!classification) {
    throw new Error("Classification not found");
  }

  const { projectId, promptId, viewId, version/*, promptVersion, viewId */ } = classification;



  // todo return all projects for admins
  // todo 

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

  const files = new Array<Schema["ViewFileProxy"]["type"]>();
  let token: string | null | undefined = null;

  do {
    //const { data, errors: resultsErrors, nextToken: newNextToken } = await client.models.Result.listResultsByClassificationId({
    //  classificationId: classificationId,
    //}, {
    //  nextToken: token,
    //  selectionSet: ["id", "classificationId", "confidence", "fileId", "labelId", "createdAt", "updatedAt", "file.*", "label.*"]
    //});

    const { data: viewFiles, errors: viewFilesErrors, nextToken: newNextToken } = await client.models.ViewFile.list({
      viewId: viewId,
      nextToken: token,
      selectionSet: ["viewId", "fileId", "createdAt", "updatedAt", "view.*", "file.*"]
    });

    if (viewFilesErrors) {
      throw new Error("Failed to get view files");
    }

    if (!viewFiles) {
      throw new Error("View files not found");
    }

    files.push(...viewFiles);
    token = newNextToken as string | null | undefined;
  } while (token);


  for (const { fileId } of files) {
    const { data: file, errors: fileErrors } = await client.models.File.get({
      id: fileId,
    }, {
      selectionSet: ["path", "name"]
    });

    if (fileErrors) {
      throw new Error("Failed to get file");
    }

    if (!file) {
      throw new Error("File not found");
    }

    const { path, name } = file;
    const { width, height } = imageSize;

    const storagePath = `${path}/${imageFormat}/${width}x${height}/${name}`; // todo check doc for leading /

    const getObjectResponse = await s3Client.send(new GetObjectCommand({
      Bucket: env.MEDIA_BUCKET_BUCKET_NAME,
      Key: storagePath,
    }));

    const body = getObjectResponse.Body;
    if (!body) {
      throw new Error('Failed to read image data');
    }

    const imageData = await body.transformToByteArray(); // use body directly?

    //const processedImage = await sharp(imageData).resize(width, height, { fit: 'inside', withoutEnlargement: true }).toFormat(format as keyof FormatEnum, { quality: imageQuality }).toBuffer();







    const { data: promptVersion, errors: promptVersionErrors } = await client.models.PromptVersion.get({
      promptId: promptId,
      version: version,
    }, {
      selectionSet: ["text", "prompt.*", "version", "labels.*"]
    });

    if (promptVersionErrors) {
      throw new Error("Failed to get prompt version");
    }

    if (!promptVersion) {
      throw new Error("Prompt version not found");
    }

    const { text } = promptVersion;


    const { data: labelRelations, errors: labelRelationsErrors } = await client.models.PromptVersionLabel.list({
      promptId: promptId,
      filter: {
        version: { eq: version }
      },
      //version: 
      selectionSet: ['promptId', 'version', 'labelId', 'label.*']
    });

    if (labelRelationsErrors) {
      throw new Error("Failed to get label relations");
    }

    const labels = labelRelations.map(labelRelation => labelRelation.label);

    // todo enable multi labeling + confidence score
    const schema = {
      nullable: false,
      description: "Selection of labels",
      type: SchemaType.ARRAY,
      minItems: 0,
      maxItems: 1,
      items: {
        type: SchemaType.OBJECT,
        description: "Label of the candidate",
        properties: {
          value: { type: SchemaType.STRING, description: "Label of the candidate", nullable: false },
          confidence: { type: SchemaType.NUMBER, format: "double", description: "Confidence score of the candidate", nullable: false },
        },
        nullable: false,
        required: ["value", "confidence"],
        propertyOrdering: ["value", "confidence"]
      }
    } as ArraySchema;

    //const generationConfig = {
    //  temperature: 1,
    //  topP: 1,
    //  topK: 40,
    //  maxOutputTokens: 8192,
    //  responseMimeType: "text/plain",
    //};


    // todo transform image 

    const model = genAI.getGenerativeModel({ // todo hoist this?
      model: env.GEMINI_MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const classificationResult = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(imageData).toString("base64"),
          mimeType: "image/webp",
        },
      },
      `Please select the most likely label for the image and return the label and confidence score. The prompt is: ${text}. Pick one of the following labels:
${labels.map(label => `- ${label.name}: ${label.description || ""}`).join("\n")}`,
    ]);

    const classificationResultText = classificationResult.response.text();

    const [item] = JSON.parse(classificationResultText);

    if (!item) {
      throw new Error("Failed to parse classification result");
    }

    const label = labels.find(label => label.name === item.value);

    if (!label) {
      throw new Error("Label not found");
    }

    console.log(classificationResultText);

    // first get list of labels
    // download the file 
    // (then generate schema based on labels) or use defined structure
    // parse the result 

    

    const { data: result, errors: resultErrors } = await client.models.Result.create({
      classificationId: classificationId,
      fileId: fileId,
      labelId: label.id,
      confidence: item.confidence,
    }, { selectionSet: ["id", "classificationId", "fileId", "labelId", "createdAt", "updatedAt", "confidence", "label.*"] });

    if (resultErrors) {
      throw new Error("Failed to create result");
    }

    if (!result) {
      throw new Error("Failed to create result");
    }
  }

  //return result;
};


//Failed to create project membership: [{"path":["createProjectMembership","project","id"],"locations":null,"message":"Cannot return null for non-nullable type: 'ID' within parent 'Project' (/createProjectMembership/project/id)"},{"path":["createProjectMembership","project","name"],"locations":null,"message":"Cannot return null for non-nullable type: 'String' within parent 'Project' (/createProjectMembership/project/name)"},{"path":["createProjectMembership","project","createdAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/createdAt)"},{"path":["createProjectMembership","project","updatedAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/updatedAt)"}]










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
