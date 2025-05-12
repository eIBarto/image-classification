import { type ClientSchema, a } from "@aws-amplify/backend";
import { createPrompt } from "./create-prompt/resource";
import { updatePrompt } from "./update-prompt/resource";
import { deletePrompt } from "./delete-prompt/resource";
import { listPrompts } from "./list-prompts/resource";
import { listPromptLabels } from "./list-prompt-labels/resource";

export const schema = a.schema({
    LabelProxy: a.customType({
        id: a.id().required(), // todo may update to composite key
        name: a.string().required(),
        description: a.string().required(),
        //projectId: a.id().required(),
        //promptId: a.id().required(),
        //version: a.string().required(),
        //promptVersion: a.ref("PromptVersionProxy"), // Todo monitor

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
        // prompt: a.ref("PromptProxy"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy").required().array(), // required()?
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

        versions: a.ref("PromptVersionProxy").required().array(), // required()?
    }),

    /*ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy5"),//.required(),
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
        .returns(a.ref("ListPromptLabelsResponse").required())//a.ref("View")
        .handler(a.handler.function(listPromptLabels))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    createPromptProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            //summary: a.string().required(),
            description: a.string(), // TODO DELETE DESCRIPTION ON PROMPT
            //promptId: a.id().required(),
            //version: a.string().required(),
            text: a.string().required(),
            labels: a.id().required().array().required()//a.json().required()//.array().required(),
        })
        .returns(a.ref("PromptProxy").required()) //a.ref("View") works here
        .handler(a.handler.function(createPrompt))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listPromptsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListPromptsResponse").required())//a.ref("View")
        .handler(a.handler.function(listPrompts))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updatePromptProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required(), summary: a.string(), description: a.string() })
        .returns(a.ref("PromptProxy").required())
        .handler(a.handler.function(updatePrompt))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deletePromptProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("PromptProxy").required())
        .handler(a.handler.function(deletePrompt))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listPrompts), allow.resource(listPromptLabels), allow.resource(createPrompt), allow.resource(updatePrompt), allow.resource(deletePrompt)]);

export type Schema = ClientSchema<typeof schema>;