"use server";

import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";

import { cookiesClient } from "@/lib/amplify-utils"
import type { Schema } from "@/amplify/data/resource"

async function createProjectInDb(data: Schema['Project']['createType']) {
    const { data: project, errors } = await cookiesClient.models.Project.create(data);

    if (errors) {
        throw new Error("Failed to create project")
    }

    if (!project) {
        throw new Error("Failed to create project")
    }

    return project
}


export const createProject = authActionClient
    .metadata({ actionName: "createProject" })
    .outputSchema(z.custom<Partial<Schema['Project']['type']>>())
    .schema(z.custom<Schema['Project']['createType']>())
    .action(async ({ parsedInput: { name, description }/*, ctx: { user } */ }) => {
        return await createProjectInDb({ name, description });
    });