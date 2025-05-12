import { type ClientSchema, a } from "@aws-amplify/backend";
import { createProject } from "./create-project/resource";
import { listProjects } from "./list-projects/resource";
import { updateProject } from "./update-project/resource";  

export const schema = a.schema({ // todo rename or use inline types
    AccessProxy1: a.enum([
        "VIEW",
        "MANAGE"
    ]),
    UserProxy3: a.customType({
        email: a.email(),
        accountId: a.id().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy2: a.customType({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy3R: a.customType({ 
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectMembershipProxy1: a.customType({
        accountId: a.id().required(),
        projectId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        user: a.ref("UserProxy3").required(),
        project: a.ref("ProjectProxy2").required(),
        access: a.ref("AccessProxy1").required()//.array().required(),
    }),
    ProjectMembershipProxyResult: a.customType({
        accountId: a.id().required(),
        projectId: a.id().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        //user: a.ref("UserProxy3").required(),
        project: a.ref("ProjectProxy3R").required(),
        access: a.ref("AccessProxy1").required()//.array().required(),
    }),
    ListProjectsResponse1: a.customType({
        items: a.ref("ProjectMembershipProxyResult").required().array().required(),
        nextToken: a.string(),
    }),
    createProjectProxy: a
        .mutation()
        .arguments({ name: a.string().required(), description: a.string() })
        .returns(a.ref("ProjectMembershipProxy1").required()) // todo might just return project
        .handler(a.handler.function(createProject))
        .authorization(allow => [allow.group("admin")/*, allow.group("admin"*/]),
    updateProjectProxy: a
        .mutation()
        .arguments({ id: a.id().required(), name: a.string(), description: a.string() })
        .returns(a.ref("ProjectProxy3R").required()) // todo might just return project
        .handler(a.handler.function(updateProject))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin"*/]),
    listProjectsProxy: a
        .query()
        .arguments({ nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListProjectsResponse1").required()) // todo might just return project
        .handler(a.handler.function(listProjects))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/])
}).authorization((allow) => [allow.resource(createProject), allow.resource(listProjects), allow.resource(updateProject)]);

export type Schema = ClientSchema<typeof schema>;