import { type ClientSchema, a } from "@aws-amplify/backend";
import { listViewFiles } from "./list-view-files/resource";
import { deleteViewFile } from "./delete-view-file/resource";
import { setViewFileLabel } from "./set-view-file-label/resource";

export const schema = a.schema({

    ImageFormatProxy1: a.enum([
        'webp',
    ]),
    ImageOptionsProxy1: a.customType({
        width: a.integer().required(),
        height: a.integer().required(),
        format: a.ref("ImageFormatProxy1").required(),
    }),
    ProjectProxy4: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy5: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    LabelProxy6: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy3"),
        files: a.ref("ViewFileProxy").required().array(),
    }),
    ViewFileProxy1: a.customType({

        viewId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        view: a.ref("ViewProxy1").required(),
        file: a.ref("FileProxy3").required(),
        label: a.ref("LabelProxy6"),
        labelId: a.id(),
    }),
    FileProxy3: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),

        author: a.ref("UserProxy5"),

        owner: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
    ListViewFilesResponse: a.customType({
        items: a.ref("ViewFileProxy1").required().array().required(),
        nextToken: a.string(),
    }),
    listViewFilesProxy: a
        .query()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy1").required() })
        .returns(a.ref("ListViewFilesResponse").required())
        .handler(a.handler.function(listViewFiles))
        .authorization(allow => [allow.authenticated()]),

    deleteViewFileProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), fileId: a.id().required() })
        .returns(a.ref("ViewFileProxy1").required())
        .handler(a.handler.function(deleteViewFile))
        .authorization(allow => [allow.authenticated()]),
    setViewFileLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), fileId: a.id().required(), labelId: a.id() })
        .returns(a.ref("ViewFileProxy1").required())
        .handler(a.handler.function(setViewFileLabel))
        .authorization(allow => [allow.authenticated()]),

}).authorization((allow) => [allow.resource(setViewFileLabel), allow.resource(listViewFiles), allow.resource(deleteViewFile)]);

export type Schema = ClientSchema<typeof schema>;