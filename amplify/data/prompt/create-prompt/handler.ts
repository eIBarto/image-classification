import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-prompt";
import { randomUUID } from 'node:crypto';
import { GoogleGenerativeAI, SchemaType, ObjectSchema } from "@google/generative-ai";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const client = generateClient<Schema>();

export const handler: Schema["createPromptProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, description, text, labels } = event.arguments;

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

    if (projectMembership.access !== "MANAGE" && projectMembership.access !== "VIEW") {
      throw new Error("Unauthorized");
    }
  }

  const schema = {
    nullable: false,
    description: "Summary of the prompt",
    type: SchemaType.OBJECT,
    properties: {
      summary: { type: SchemaType.STRING, description: "Summary of the prompt", nullable: false },
      //version: { type: SchemaType.STRING, description: "An identifier for the version of the prompt", nullable: false },
    },
    required: ["summary"],
    propertyOrdering: ["summary"],
  } as ObjectSchema;

  const verboseLabels = await Promise.all(labels.map(async (label) => {
    const { data, errors } = await client.models.Label.get({
      id: label,
    });
    
    if (errors) {
      throw new Error("Failed to get label");
    }

    if (!data) {
      throw new Error("Failed to get label");
    }

    return data;
  }));

  const model = genAI.getGenerativeModel({ // todo hoist this?
    model: env.GEMINI_MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const summaryResult = await model.generateContent([
    "Please create a summary for the following prompt: " + text + "\n\n" + verboseLabels.map((label) => label.name + ": " + label.description).join("\n"),
  ]);

  const summaryText = summaryResult.response.text();

  const { summary } = JSON.parse(summaryText);

  const { data: prompt, errors: promptErrors } = await client.models.Prompt.create({
    summary: summary,
    description: description,
    projectId: projectId,
  }, { selectionSet: ["id", "summary", "description", "projectId", "createdAt", "updatedAt"] }); // todo add project to selection set

  if (promptErrors) {
    throw new Error("Failed to create prompt");
  }

  if (!prompt) {
    throw new Error("Failed to create prompt");
  }

  const { data: promptVersion, errors: promptVersionErrors } = await client.models.PromptVersion.create({
    promptId: prompt.id,
    version: randomUUID(),
    text: text,
  }, { selectionSet: ["promptId", "version", "text", "createdAt", "updatedAt"] }); // todo add project to selection set

  if (promptVersionErrors) {
    throw new Error("Failed to create prompt version");
  }

  if (!promptVersion) {
    throw new Error("Failed to create prompt version");
  }

  for (const labelId of labels) {

    const { data: label, errors: labelErrors } = await client.models.PromptVersionLabel.create({
      promptId: prompt.id,
      version: promptVersion.version,
      labelId: labelId,
    });

    if (labelErrors) {
      throw new Error("Failed to create label");
    }

    if (!label) {
      throw new Error("Failed to create label");
    }
  }

  return { ...prompt, project: null };
};


//Failed to create project membership: [{"path":["createProjectMembership","project","id"],"locations":null,"message":"Cannot return null for non-nullable type: 'ID' within parent 'Project' (/createProjectMembership/project/id)"},{"path":["createProjectMembership","project","name"],"locations":null,"message":"Cannot return null for non-nullable type: 'String' within parent 'Project' (/createProjectMembership/project/name)"},{"path":["createProjectMembership","project","createdAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/createdAt)"},{"path":["createProjectMembership","project","updatedAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/updatedAt)"}]