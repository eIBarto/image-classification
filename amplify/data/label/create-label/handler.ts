import { AppSyncIdentityCognito } from 'aws-lambda';
import type { Schema } from '../../resource';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/create-label";
import { z } from "zod";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
const labelSchema = z.array(z.object({ // todo might reference schema
  name: z.string(),
  description: z.string(),
}));

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["createLabelProxy"]["functionHandler"] = async (event) => {
  const { identity } = event;
  const { projectId, name, description, promptId } = event.arguments;

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

  const { data: label, errors } = await client.models.Label.create({
    name: name,
    description: description,
    projectId: projectId,
    //promptId: promptId,
  }, { selectionSet: ["id", "name", "description", /*"projectId",*/ "createdAt", "updatedAt"] }); // todo add project to selection set

  if (errors) {
    throw new Error("Failed to create label");
  }

  if (!label) {
    throw new Error("Failed to create label");
  }

  if (promptId) {
    const { data: promptLabel, errors: promptLabelErrors } = await client.models.PromptLabel.create({
      promptId: promptId,
      labelId: label.id,
    });

    if (promptLabelErrors) {
      throw new Error("Failed to create prompt label");
    }

    if (!promptLabel) {
      throw new Error("Failed to create prompt label");
    }
  }

  return label;
};

//Failed to create project membership: [{"path":["createProjectMembership","project","id"],"locations":null,"message":"Cannot return null for non-nullable type: 'ID' within parent 'Project' (/createProjectMembership/project/id)"},{"path":["createProjectMembership","project","name"],"locations":null,"message":"Cannot return null for non-nullable type: 'String' within parent 'Project' (/createProjectMembership/project/name)"},{"path":["createProjectMembership","project","createdAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/createdAt)"},{"path":["createProjectMembership","project","updatedAt"],"locations":null,"message":"Cannot return null for non-nullable type: 'AWSDateTime' within parent 'Project' (/createProjectMembership/project/updatedAt)"}]