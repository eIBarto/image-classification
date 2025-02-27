import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { schema as projectMembershipSchema } from "./project-membership/schema";
import { schema as userSchema } from "./user/schema";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { onUpload } from "../storage/on-upload/resource";
import { onDelete } from "../storage/on-delete/resource";

const schema = a.schema({
  User: a
    .model({
      email: a.string(),
      accountId: a.string().required().authorization(allow => [allow.owner().to(['read', 'delete']), allow.authenticated().to(['read'])]),
      owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.authenticated().to(['read'])]),

      memberships: a.hasMany("ProjectMembership", "accountId"),
      projects: a.hasMany("Project", "authorId"),
      files: a.hasMany("File", "authorId"),

    }).identifier(["accountId"])
    //.secondaryIndexes((index) => [
    //  index("accountId")
    //    .queryField("listByAccountId"),
    //])
    .authorization((allow) => [ //todo may handle auth on entity level instead of field level
      allow.ownerDefinedIn("owner"),
      //allow.authenticated().to(['read']) // todo update permissions "identityPool"
    ]),
  Access: a.enum([
    'VIEW',
    'MANAGE'
  ]),
  ProjectMembership: a.model({
    projectId: a.string().required(),
    accountId: a.string().required(),
    user: a.belongsTo("User", "accountId"),
    project: a.belongsTo("Project", "projectId"),
    access: a.ref('Access').required(),
  })
    .identifier(['projectId', 'accountId'])
    .authorization((allow) => [allow.authenticated()]),
  Project: a.model({
    name: a.string().required(),
    description: a.string(),

    files: a.hasMany("File", "projectId"),
    //viewers: a.string().array(),
    //owner: a.string(),
    members: a.hasMany('ProjectMembership', 'projectId'),

    // MARK: Author to Project one to many relationship
    authorId: a.string(),
    author: a.belongsTo('User', 'authorId'),
  }).authorization((allow) => [allow.authenticated()/*, allow.ownerDefinedIn("owner"), allow.ownersDefinedIn("viewers")*/, allow.group("ADMINS")]),
  File: a.model({ // todo add missing properties such as mimeType as required 
    path: a.string().required(),
    size: a.integer(),
    eTag: a.string().required(),
    versionId: a.string(),
    owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete', 'create']), allow.authenticated().to(['read'])]),

    // MARK: Project to File one to many relationship
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    // MARK: Author to File one to many relationship
    authorId: a.string(),
    author: a.belongsTo('User', 'authorId'),
  }).secondaryIndexes((index) => [
    index("path")
      .queryField("listByPath"),
  ])
    .authorization((allow) => [allow.authenticated()]),

}).authorization((allow) => [allow.resource(postConfirmation), allow.resource(onUpload), allow.resource(onDelete)]);

export const combinedSchema = a.combine([schema, projectMembershipSchema, userSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});