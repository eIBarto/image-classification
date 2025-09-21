import { type ClientSchema, a } from "@aws-amplify/backend";
import { listProjectFiles } from "./list-project-files/resource";
import { deleteProjectFile } from "./delete-project-file/resource";
import { getProjectFile } from "./get-project-file/resource";
import { updateProjectFile } from "./update-project-file/resource";

export const schema = a.schema({

    ImageFormatProxy: a.enum([
        'webp',
    ]),
    ImageOptionsProxy: a.customType({
        width: a.integer().required(),
        height: a.integer().required(),
        format: a.ref("ImageFormatProxy").required(),
    }),
    ProjectProxy1: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    UserProxy2: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectFileProxy: a.customType({

        projectId: a.id().required(),
        fileId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        project: a.ref("ProjectProxy1").required(),
        file: a.ref("FileProxy").required(),

    }),
    FileProxy: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),

        author: a.ref("UserProxy2"),

        owner: a.string(),

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
    ListProjectFilesResponse: a.customType({
        items: a.ref("ProjectFileProxy").required().array().required(),
        nextToken: a.string(),
    }),
    listProjectFilesProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy").required() })
        .returns(a.ref("ListProjectFilesResponse").required())
        .handler(a.handler.function(listProjectFiles))
        .authorization(allow => [allow.authenticated()]),
    updateProjectFileProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), name: a.string().required() })
        .returns(a.ref("FileProxy").required())
        .handler(a.handler.function(updateProjectFile))
        .authorization(allow => [allow.authenticated()]),
    deleteProjectFileProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), fileId: a.id().required() })
        .returns(a.ref("ProjectFileProxy").required())
        .handler(a.handler.function(deleteProjectFile))
        .authorization(allow => [allow.authenticated()]),
    getProjectFileProxy: a
        .query()
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), imageOptions: a.ref("ImageOptionsProxy").required() })
        .returns(a.ref("ProjectFileProxy").required())
        .handler(a.handler.function(getProjectFile))
        .authorization(allow => [allow.authenticated()])
}).authorization((allow) => [allow.resource(listProjectFiles), allow.resource(deleteProjectFile), allow.resource(getProjectFile), allow.resource(updateProjectFile)]);

export type Schema = ClientSchema<typeof schema>;