import { type ClientSchema, a } from "@aws-amplify/backend";
import { createLabel } from "./create-label/resource";
import { updateLabel } from "./update-label/resource";
import { deleteLabel } from "./delete-label/resource";
import { listLabels } from "./list-labels/resource";

export const schema = a.schema({
    LabelInputProxy1: a.customType({
        name: a.string().required(),
        description: a.string(), // todo require?
    }),
    LabelProxy4: a.customType({
        id: a.id().required(), // todo may update to composite key
        name: a.string().required(),
        description: a.string().required(),
        //promptId: a.id().required(),
        //projectId: a.id().required(),
        //version: a.string().required(),
        //promptVersion: a.ref("PromptVersionProxy4"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    /*UserProxy10: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),*/
    ProjectProxy9: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    PromptVersionProxy4: a.customType({
        version: a.string().required(),
        text: a.string().required(),
        promptId: a.id().required(),
        // prompt: a.ref("PromptProxy4"), // Todo monitor

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy4").required().array(), // required()?
    }),
    PromptProxy4: a.customType({
        id: a.id().required(),
        summary: a.string(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy9"),
        activeVersion: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        versions: a.ref("PromptVersionProxy4").required().array(), // required()?
    }),

    /*ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy9"),//.required(),
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
    ListLabelsResponse1: a.customType({
        items: a.ref("LabelProxy4").required().array().required(),
        nextToken: a.string(),
    }),
    listLabelsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListLabelsResponse1").required())//a.ref("View")
        .handler(a.handler.function(listLabels))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    createLabelProxy: a // todo might move to its own schema
        .mutation()
        .arguments({ projectId: a.id().required(), name: a.string().required(), description: a.string().required(), promptId: a.id() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(createLabel))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updateLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required()/*, promptId: a.id().required()*/, name: a.string(), description: a.string() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(updateLabel))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deleteLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(deleteLabel))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listLabels), allow.resource(createLabel), allow.resource(updateLabel), allow.resource(deleteLabel)]);

export type Schema = ClientSchema<typeof schema>;