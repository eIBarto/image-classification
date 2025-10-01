import { type ClientSchema, a } from "@aws-amplify/backend";
import { createPrompt } from "./create-prompt/resource";
import { updatePrompt } from "./update-prompt/resource";
import { deletePrompt } from "./delete-prompt/resource";
import { listPrompts } from "./list-prompts/resource";
import { listPromptLabels } from "./list-prompt-labels/resource";

export const schema = a.schema({
    LabelProxy: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy6: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy5: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    PromptVersionProxy: a.customType({
        version: a.string().required(),
        text: a.string().required(),
        promptId: a.id().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy").required().array(),
    }),
    PromptProxy: a.customType({
        id: a.id().required(),
        summary: a.string(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy5"),
        activeVersion: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        versions: a.ref("PromptVersionProxy").required().array(),
    }),

    ListPromptsResponse: a.customType({
        items: a.ref("PromptProxy").required().array().required(),
        nextToken: a.string(),
    }),
    ListPromptLabelsResponse: a.customType({
        items: a.ref("LabelProxy").required().array().required(),
        nextToken: a.string(),
    }),
    listPromptLabelsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListPromptLabelsResponse").required())
        .handler(a.handler.function(listPromptLabels))
        .authorization(allow => [allow.authenticated()]),
    createPromptProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),

            description: a.string(),

            text: a.string().required(),
            labels: a.id().required().array().required()
        })
        .returns(a.ref("PromptProxy").required())
        .handler(a.handler.function(createPrompt))
        .authorization(allow => [allow.authenticated()]),
    listPromptsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListPromptsResponse").required())
        .handler(a.handler.function(listPrompts))
        .authorization(allow => [allow.authenticated()]),
    updatePromptProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required(), summary: a.string(), description: a.string() })
        .returns(a.ref("PromptProxy").required())
        .handler(a.handler.function(updatePrompt))
        .authorization(allow => [allow.authenticated()]),
    deletePromptProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("PromptProxy").required())
        .handler(a.handler.function(deletePrompt))
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(listPrompts), allow.resource(listPromptLabels), allow.resource(createPrompt), allow.resource(updatePrompt), allow.resource(deletePrompt)]);

export type Schema = ClientSchema<typeof schema>;