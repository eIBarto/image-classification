import { type ClientSchema, a } from "@aws-amplify/backend";
import { listProjectFiles } from "./list-project-files/resource";
import { deleteProjectFile } from "./delete-project-file/resource";
import { getProjectFile } from "./get-project-file/resource";
import { updateProjectFile } from "./update-project-file/resource";

export const schema = a.schema({ // todo rename or use inline types
    /*SizeProxy: a.enum([
        'SMALL',
        'MEDIUM',
        'LARGE',
    ]),*/
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
        accountId: a.string().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectFileProxy: a.customType({
        //id: a.id().required(),
        projectId: a.string().required(),
        fileId: a.string().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        project: a.ref("ProjectProxy1").required(),
        file: a.ref("FileProxy").required(),
        //size: a.ref("SizeProxy").required(),
    }),
    FileProxy: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        path: a.string().required(),
        //size: a.integer(),
        //eTag: a.string().required(),
        //versionId: a.string(),
        //projectId: a.id().required(),
        //projects: a.ref("ProjectProxy1"),
        //authorId: a.string(),
        author: a.ref("UserProxy2"),

        owner: a.string(),  // todo might remove this field

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
    ListProjectFilesResponse: a.customType({
        items: a.ref("ProjectFileProxy").required().array().required(),
        nextToken: a.string(),
    }),
    listProjectFilesProxy: a // todo rename to listFilesByProjectIdProxy?
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy").required() })
        .returns(a.ref("ListProjectFilesResponse").required())//a.ref("File")
        .handler(a.handler.function(listProjectFiles))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updateProjectFileProxy: a // to
        .mutation()
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), name: a.string().required() })
        .returns(a.ref("FileProxy").required())
        .handler(a.handler.function(updateProjectFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deleteProjectFileProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), fileId: a.id().required() })
        .returns(a.ref("ProjectFileProxy").required())
        .handler(a.handler.function(deleteProjectFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin"*/]),
    getProjectFileProxy: a
        .query() // mutation oder query?
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), imageOptions: a.ref("ImageOptionsProxy").required() })
        .returns(a.ref("ProjectFileProxy").required())
        .handler(a.handler.function(getProjectFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin"*/])
}).authorization((allow) => [allow.resource(listProjectFiles), allow.resource(deleteProjectFile), allow.resource(getProjectFile), allow.resource(updateProjectFile)]);

export type Schema = ClientSchema<typeof schema>;