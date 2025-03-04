import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { schema as projectMembershipSchema } from "./project-membership/schema";
import { schema as userSchema } from "./user/schema";
import { schema as fileSchema } from "./project-file/schema";
import { schema as projectSchema } from "./project/schema";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { onUpload } from "../storage/on-upload/resource";

const schema = a.schema({ // todo update required fields
  User: a
    .model({
      email: a.email(),
      accountId: a.id().required().authorization(allow => [allow.owner().to(['read', 'delete']), allow.authenticated().to(['read'])]),
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
  /* Size: a.enum([
     'SMALL',
     'MEDIUM',
     'LARGE',
   ]),*/
  ProjectFile: a.model({
    //id: a.id().required(), //.default(crypto.randomUUID()),
    projectId: a.id().required(),
    fileId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
    file: a.belongsTo("File", "fileId"),
    //    size: a.ref('Size').required(),
  })
    .identifier(['projectId', 'fileId'])
    .secondaryIndexes((index) => [index("fileId").queryField("listByProjectFileId")])
    .authorization((allow) => [allow.authenticated()]),
  Access: a.enum([
    'VIEW',
    'MANAGE'
  ]),
  ProjectMembership: a.model({
    accountId: a.id().required(),
    projectId: a.id().required(),
    user: a.belongsTo("User", "accountId"),
    project: a.belongsTo("Project", "projectId"),
    access: a.ref('Access').required(),
  })
    .identifier(['accountId', 'projectId']) // todo change order to optimize query performance
    .secondaryIndexes((index) => [index("projectId").queryField("listByProjectId")])
    .authorization((allow) => [allow.authenticated()]),
  Project: a.model({
    name: a.string().required(),
    description: a.string(),

    files: a.hasMany("ProjectFile", "projectId"),
    //viewers: a.string().array(),
    //owner: a.string(),
    members: a.hasMany('ProjectMembership', 'projectId'),

    // MARK: Author to Project one to many relationship
    authorId: a.id(),
    author: a.belongsTo('User', 'authorId'),
  }).authorization((allow) => [/*,allow.authenticated() allow.ownerDefinedIn("owner"), allow.ownersDefinedIn("viewers")*/allow.group("admin")]),
  //file wird Entry
  //Entry hat ein ImageSet (name, DIRECTORY?)
  // 
  // Project hat mehrere entries

  File: a.model({ // todo add missing properties such as mimeType as required 
    path: a.string().required(),
    name: a.string().required(),

    //size: a.integer(),
    //eTag: a.string().required(),
    //versionId: a.string(),
    owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete', 'create']), allow.authenticated().to(['read'])]), // todo might remove this field

    // MARK: Project to File one to many relationship
    projects: a.hasMany("ProjectFile", "fileId"),

    // MARK: Author to File one to many relationship
    authorId: a.id(),
    author: a.belongsTo('User', 'authorId'),

    //    meta: a.json(),
    //    contentType: a.string(),
  }).secondaryIndexes((index) => [
    index("path")
      .queryField("listByPath")
  ])
    .authorization((allow) => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(postConfirmation), allow.resource(onUpload)]);

export const combinedSchema = a.combine([schema, projectMembershipSchema, userSchema, fileSchema, projectSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});