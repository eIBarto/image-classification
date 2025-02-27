import { type ClientSchema, a } from "@aws-amplify/backend";
import { createProjectMembership } from "./create-project-membership/resource";
import { listProjectMemberships } from "./list-project-memberships/resource";
import { updateProjectMembership } from "./update-project-membership/resource";
import { deleteProjectMembership } from "./delete-project-membership/resource";

export const schema = a.schema({
    AccessProxy: a.enum([
        "VIEW",
        "MANAGE"
    ]),
    UserProxy: a.customType({
        email: a.string(),
        accountId: a.string().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy: a.customType({
        name: a.string().required(),
        description: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectMembershipProxy: a.customType({
        accountId: a.string().required(),
        projectId: a.string().required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
        user: a.ref("UserProxy"),
        project: a.ref("ProjectProxy"),
        access: a.ref("AccessProxy").required()//.array().required(),
    }),
    ListProjectMembershipsResponse: a.customType({
        items: a.ref("ProjectMembershipProxy").required().array().required(),
        nextToken: a.string(),
    }),
    createProjectMembershipProxy: a
        .mutation()
        .arguments({
            projectId: a.id().required(),
            accountId: a.string().required(),
        })
        .returns(a.ref("ProjectMembershipProxy")) //a.ref("ProjectMembership") works here
        .handler(a.handler.function(createProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("ADMINS")*/]),
    listProjectMembershipsProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListProjectMembershipsResponse"))//a.ref("ProjectMembership")
        .handler(a.handler.function(listProjectMemberships))
        .authorization(allow => [allow.authenticated()/*, allow.group("ADMINS")*/]),
    updateProjectMembershipProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), accountId: a.string().required(), access: a.ref("AccessProxy").required() })
        .returns(a.ref("ProjectMembershipProxy"))
        .handler(a.handler.function(updateProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("ADMINS")*/]),
    deleteProjectMembershipProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), accountId: a.string().required() })
        .returns(a.ref("ProjectMembershipProxy"))
        .handler(a.handler.function(deleteProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("ADMINS")*/]),
}).authorization((allow) => [allow.resource(listProjectMemberships), allow.resource(createProjectMembership), allow.resource(updateProjectMembership), allow.resource(deleteProjectMembership)]);

export type Schema = ClientSchema<typeof schema>;