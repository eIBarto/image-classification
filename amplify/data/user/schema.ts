import { type ClientSchema, a } from "@aws-amplify/backend";
import { listUsers } from "./list-users/resource";

export const schema = a.schema({
    UserProxy1: a.customType({
        email: a.email(),
        accountId: a.string().required(),
        owner: a.string(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
    }),
    ListUsersResponse: a.customType({
        items: a.ref("UserProxy1").required().array().required(),
        nextToken: a.string(),
    }),
    listUsersProxy: a
        .query()
        .arguments({ nextToken: a.string(), limit: a.integer(), query: a.string() })
        .returns(a.ref("ListUsersResponse").required())//a.ref("ProjectMembership")
        .handler(a.handler.function(listUsers))
        .authorization(allow => [allow.authenticated()/*, allow.group("admin")*/]),
}).authorization((allow) => [allow.resource(listUsers)]);

export type Schema = ClientSchema<typeof schema>;