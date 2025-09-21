import { type ClientSchema, a } from "@aws-amplify/backend";
import { createView } from "./create-view/resource";
import { updateView } from "./update-view/resource";
import { deleteView } from "./delete-view/resource";
import { listViews } from "./list-views/resource";

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

        author: a.ref("UserProxy4"),

        owner: a.string(),

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
        project: a.ref("ProjectProxy3"),
        files: a.ref("ViewFileProxy").required().array()
    }),
    ViewFileProxy: a.customType({
        viewId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

    }),
    ListViewsResponse: a.customType({
        items: a.ref("ViewProxy").required().array().required(),
        nextToken: a.string(),
    }),
    LabelProxy5: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

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
        .returns(a.ref("ViewProxy").required())
        .handler(a.handler.function(createView))
        .authorization(allow => [allow.authenticated()]),
    listViewsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer(), query: a.string() })
        .returns(a.ref("ListViewsResponse").required())
        .handler(a.handler.function(listViews))
        .authorization(allow => [allow.authenticated()]),
    updateViewProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), name: a.string(), description: a.string() })
        .returns(a.ref("ViewProxy").required())
        .handler(a.handler.function(updateView))
        .authorization(allow => [allow.authenticated()]),
    deleteViewProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required() })
        .returns(a.ref("ViewProxy").required())
        .handler(a.handler.function(deleteView))
        .authorization(allow => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(listViews), allow.resource(createView), allow.resource(updateView), allow.resource(deleteView)]);

export type Schema = ClientSchema<typeof schema>;