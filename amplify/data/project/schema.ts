import { type ClientSchema, a } from "@aws-amplify/backend";
import { createProject } from "./create-project/resource";

export const schema = a.schema({ // todo rename or use inline types
    AccessProxy1: a.enum([
        "VIEW",
        "MANAGE"
    ]),
    UserProxy3: a.customType({
        email: a.email(),
        accountId: a.string().required(),
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
    ProjectMembershipProxy1: a.customType({
        accountId: a.string().required(),
        projectId: a.string().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        user: a.ref("UserProxy3").required(),
        project: a.ref("ProjectProxy2").required(),
        access: a.ref("AccessProxy1").required()//.array().required(),
    }),
    createProjectProxy: a
        .mutation()
        .arguments({ name: a.string().required(), description: a.string() })
        .returns(a.ref("ProjectMembershipProxy1").required()) // todo might just return project
        .handler(a.handler.function(createProject))
        .authorization(allow => [allow.group("admin")/*, allow.group("admin"*/])
}).authorization((allow) => [allow.resource(createProject)]);

export type Schema = ClientSchema<typeof schema>;