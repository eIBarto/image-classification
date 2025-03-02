import { type ClientSchema, a } from "@aws-amplify/backend";
import { createProjectMembership } from "./create-project-membership/resource";
import { listProjectMembershipsByProject } from "./list-project-memberships-by-project/resource";
import { updateProjectMembership } from "./update-project-membership/resource";
import { deleteProjectMembership } from "./delete-project-membership/resource";
import { listProjectMembershipsByAccount } from "./list-project-memberships-by-account/resource";

export const schema = a.schema({
    AccessProxy: a.enum([
        "VIEW",
        "MANAGE"
    ]),
    UserProxy: a.customType({
        email: a.email(),
        accountId: a.string().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ProjectProxy: a.customType({
        id: a.id().required(),
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
        user: a.ref("UserProxy").required(),
        project: a.ref("ProjectProxy").required(),
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
        .returns(a.ref("ProjectMembershipProxy").required()) //a.ref("ProjectMembership") works here
        .handler(a.handler.function(createProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listProjectMembershipsByProjectProxy: a
        .query()
        .arguments({ projectId: a.id().required(), nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListProjectMembershipsResponse").required())//a.ref("ProjectMembership")
        .handler(a.handler.function(listProjectMembershipsByProject))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    listProjectMembershipsByAccountProxy: a
        .query()
        .arguments({ nextToken: a.string(), limit: a.integer() })
        .returns(a.ref("ListProjectMembershipsResponse").required())//a.ref("ProjectMembership")
        .handler(a.handler.function(listProjectMembershipsByAccount))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    updateProjectMembershipProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), accountId: a.string().required(), access: a.ref("AccessProxy").required() })
        .returns(a.ref("ProjectMembershipProxy").required())
        .handler(a.handler.function(updateProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
    deleteProjectMembershipProxy: a
        .mutation()
        .arguments({ projectId: a.id().required(), accountId: a.string().required() })
        .returns(a.ref("ProjectMembershipProxy").required())
        .handler(a.handler.function(deleteProjectMembership))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listProjectMembershipsByProject), allow.resource(listProjectMembershipsByAccount), allow.resource(createProjectMembership), allow.resource(updateProjectMembership), allow.resource(deleteProjectMembership)]);

export type Schema = ClientSchema<typeof schema>;