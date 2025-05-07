import { type ClientSchema, a } from "@aws-amplify/backend";
import { listViewFiles } from "./list-view-files/resource";
import { deleteViewFile } from "./delete-view-file/resource";
import { setViewFileLabel } from "./set-view-file-label/resource";

export const schema = a.schema({ // todo rename or use inline types
    /*SizeProxy: a.enum([
        'SMALL',
        'MEDIUM',
        'LARGE',
    ]),*/
    ViewLabelProxy1: a.customType({
        viewId: a.id().required(),
        labelId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        view: a.ref("ViewProxy1"),//.required(),
        label: a.ref("LabelProxy6")//.required(),
    }),
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
    ViewProxy1: a.customType({
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        projectId: a.id().required(),
        project: a.ref("ProjectProxy3"),//.required(),
        files: a.ref("ViewFileProxy").required().array(),//.required()
    }),
    ViewFileProxy1: a.customType({
        //id: a.id().required(),
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
        //size: a.integer(),
        //eTag: a.string().required(),
        //versionId: a.string(),
        //projectId: a.id().required(),
        //projects: a.ref("ProjectProxy1"),
        //authorId: a.string(),
        author: a.ref("UserProxy5"),

        owner: a.string(),  // todo might remove this field

        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),

        resource: a.url(),
    }),
    ListViewFilesResponse: a.customType({
        items: a.ref("ViewFileProxy1").required().array().required(),
        nextToken: a.string(),
    }),
    listViewFilesProxy: a // todo rename to listFilesByProjectIdProxy?
        .query()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), nextToken: a.string(), limit: a.integer(), imageOptions: a.ref("ImageOptionsProxy1").required() })
        .returns(a.ref("ListViewFilesResponse").required())//a.ref("File")
        .handler(a.handler.function(listViewFiles))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    /*updateViewFileProxy: a // to
        .mutation()
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), name: a.string().required() })
        .returns(a.ref("FileProxy").required())
        .handler(a.handler.function(updateViewFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")]),*/
    deleteViewFileProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), fileId: a.id().required() })
        .returns(a.ref("ViewFileProxy1").required())
        .handler(a.handler.function(deleteViewFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin"*/]),
    setViewFileLabelProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), viewId: a.id().required(), fileId: a.id().required(), labelId: a.id().required() })
        .returns(a.ref("ViewFileProxy1").required())
        .handler(a.handler.function(setViewFileLabel))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    /*getViewFileProxy: a
        .query() // mutation oder query?
        .arguments({ projectId: a.id().required(), fileId: a.id().required(), imageOptions: a.ref("ImageOptionsProxy").required() })
        .returns(a.ref("ViewFileProxy").required())
        .handler(a.handler.function(getViewFile))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin"//])*/
}).authorization((allow) => [allow.resource(setViewFileLabel), allow.resource(listViewFiles), allow.resource(deleteViewFile)]);

export type Schema = ClientSchema<typeof schema>;