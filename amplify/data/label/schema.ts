import { type ClientSchema, a } from "@aws-amplify/backend";
import { createLabel } from "./create-label/resource";
import { updateLabel } from "./update-label/resource";
import { deleteLabel } from "./delete-label/resource";
import { listLabels } from "./list-labels/resource";

export const schema = a.schema({
    LabelInputProxy1: a.customType({
        name: a.string().required(),
        description: a.string(),
    }),
    LabelProxy4: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),

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

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        labels: a.ref("LabelProxy4").required().array(),
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

        versions: a.ref("PromptVersionProxy4").required().array(),
    }),

    ListLabelsResponse1: a.customType({
        items: a.ref("LabelProxy4").required().array().required(),
        nextToken: a.string(),
    }),
    listLabelsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListLabelsResponse1").required())
        .handler(a.handler.function(listLabels))
        .authorization(allow => [allow.authenticated()]),
    createLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), name: a.string().required(), description: a.string().required(), promptId: a.id() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(createLabel))
        .authorization(allow => [allow.authenticated()]),
    updateLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required(), name: a.string(), description: a.string() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(updateLabel))
        .authorization(allow => [allow.authenticated()]),
    deleteLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), id: a.id().required() })
        .returns(a.ref("LabelProxy4").required())
        .handler(a.handler.function(deleteLabel))
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(listLabels), allow.resource(createLabel), allow.resource(updateLabel), allow.resource(deleteLabel)]);

export type Schema = ClientSchema<typeof schema>;