import { type ClientSchema, a } from "@aws-amplify/backend";
import { createPromptVersion } from "./create-prompt-version/resource";
import { updatePromptVersion } from "./update-prompt-version/resource";
import { deletePromptVersion } from "./delete-prompt-version/resource";
import { listPromptVersions } from "./list-prompts-versions/resource";

export const schema = a.schema({
    LabelProxy1: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),

    ProjectProxy6: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    PromptVersionProxy1: a.customType({
        version: a.string().required(),
        text: a.string().required(),
        promptId: a.id().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy1").required().array(),
    }),
    PromptProxy1: a.customType({
        id: a.id().required(),
        summary: a.string(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy6"),
        activeVersion: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        versions: a.ref("PromptVersionProxy1").required().array(),
    }),

    ListPromptVersionsResponse: a.customType({
        items: a.ref("PromptVersionProxy1").required().array().required(),
        nextToken: a.string(),
    }),
    createPromptVersionProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            promptId: a.id().required(),

            text: a.string().required(),
            labels: a.id().required().array().required()
        })
        .returns(a.ref("PromptVersionProxy1").required())
        .handler(a.handler.function(createPromptVersion))
        .authorization(allow => [allow.authenticated()]),
    listPromptVersionsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListPromptVersionsResponse").required())
        .handler(a.handler.function(listPromptVersions))
        .authorization(allow => [allow.authenticated()]),
    updatePromptVersionProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), version: a.string().required(), text: a.string() })
        .returns(a.ref("PromptVersionProxy1").required())
        .handler(a.handler.function(updatePromptVersion))
        .authorization(allow => [allow.authenticated()]),
    deletePromptVersionProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), version: a.string().required() })
        .returns(a.ref("PromptVersionProxy1").required())
        .handler(a.handler.function(deletePromptVersion))
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(listPromptVersions), allow.resource(createPromptVersion), allow.resource(updatePromptVersion), allow.resource(deletePromptVersion)]);

export type Schema = ClientSchema<typeof schema>;