import { type ClientSchema, a } from "@aws-amplify/backend";
import { createView } from "./create-view/resource";
import { updateView } from "./update-view/resource";
import { deleteView } from "./delete-view/resource";
import { listViews } from "./list-views/resource";
import { listViewLabels } from "./list-view-labels/resource";

export const schema = a.schema({
    UserProxy4: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy3: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    FileProxy2: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),
        //size: a.integer(),
        //eTag: a.string().required(),
        //versionId: a.string(),
        //projectId: a.id().required(),
        //projects: a.ref("ProjectProxy1"),
        //authorId: a.string(),
        author: a.ref("UserProxy4"),

        owner: a.string(),  // todo might remove this field

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
    ViewProxy: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy3"),//.required(),
        files: a.ref("ViewFileProxy").required().array()//.required()
    }),
    ViewFileProxy: a.customType({
        viewId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        //view: a.ref("ViewProxy").required(), // todo this is only available on ViewFile queries, not on View queries
        //file: a.ref("FileProxy2").required(),
    }),
    ListViewsResponse: a.customType({
        items: a.ref("ViewProxy").required().array().required(),
        nextToken: a.string(),
    }),
    LabelProxy5: a.customType({
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
    createViewProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            name: a.string().required(),
            description: a.string(),
            files: a.id().required().array()
        })
        .returns(a.ref("ViewProxy").required()) //a.ref("View") works here
        .handler(a.handler.function(createView))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listViewsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer(), query: a.string() })
        .returns(a.ref("ListViewsResponse").required())//a.ref("View")
        .handler(a.handler.function(listViews))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),


    ListViewLabelsResponse: a.customType({
        items: a.ref("LabelProxy5").required().array().required(),
        nextToken: a.string(),
    }),
    listViewLabelsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListViewLabelsResponse").required())//a.ref("View")
        .handler(a.handler.function(listViewLabels))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updateViewProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), name: a.string(), description: a.string() })
        .returns(a.ref("ViewProxy").required())
        .handler(a.handler.function(updateView))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deleteViewProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required() })
        .returns(a.ref("ViewProxy").required())
        .handler(a.handler.function(deleteView))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listViews), allow.resource(createView), allow.resource(updateView), allow.resource(deleteView), allow.resource(listViewLabels)]);

export type Schema = ClientSchema<typeof schema>;