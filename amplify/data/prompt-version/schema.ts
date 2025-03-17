import { type ClientSchema, a } from "@aws-amplify/backend";
import { createPromptVersion } from "./create-prompt-version/resource";
import { updatePromptVersion } from "./update-prompt-version/resource";
import { deletePromptVersion } from "./delete-prompt-version/resource";
import { listPromptVersions } from "./list-prompts-version/resource";

export const schema = a.schema({
    LabelInputProxy1: a.customType({
        name: a.string().required(),
        description: a.string(), // todo require?
    }),
    LabelProxy1: a.customType({
        id: a.id().required(), // todo may update to composite key
        name: a.string().required(),
        description: a.string(),
        promptId: a.id().required(),
        version: a.string().required(),
        //promptVersion: a.ref("PromptVersionProxy1"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy7: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
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
        // prompt: a.ref("PromptProxy1"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy1").required().array(), // required()?
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

        versions: a.ref("PromptVersionProxy1").required().array(), // required()?
    }),

    /*ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy6"),//.required(),
        files: a.ref("ViewFileProxy1").required().array()//.required()
    }),
    ViewFileProxy1: a.customType({
        viewId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        //view: a.ref("ViewProxy").required(), // todo this is only available on ViewFile queries, not on View queries
        //file: a.ref("FileProxy2").required(),
    }),*/
    ListPromptVersionsResponse: a.customType({
        items: a.ref("PromptVersionProxy1").required().array().required(),
        nextToken: a.string(),
    }),
    createPromptVersionProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            promptId: a.id().required(),
            version: a.string().required(),
            text: a.string().required(),
            labels: a.json().required()//.array().required(),
        })
        .returns(a.ref("PromptVersionProxy1").required()) //a.ref("View") works here
        .handler(a.handler.function(createPromptVersion))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listPromptVersionsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListPromptVersionsResponse").required())//a.ref("View")
        .handler(a.handler.function(listPromptVersions))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updatePromptVersionProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), version: a.string().required(), text: a.string() })
        .returns(a.ref("PromptVersionProxy1").required())
        .handler(a.handler.function(updatePromptVersion))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deletePromptVersionProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), promptId: a.id().required(), version: a.string().required() })
        .returns(a.ref("PromptVersionProxy1").required())
        .handler(a.handler.function(deletePromptVersion))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listPromptVersions), allow.resource(createPromptVersion), allow.resource(updatePromptVersion), allow.resource(deletePromptVersion)]);

export type Schema = ClientSchema<typeof schema>;