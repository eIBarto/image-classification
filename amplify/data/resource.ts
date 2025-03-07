import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { schema as projectMembershipSchema } from "./project-membership/schema";
import { schema as userSchema } from "./user/schema";
import { schema as fileSchema } from "./project-file/schema";
import { schema as projectSchema } from "./project/schema";
import { schema as projectViewSchema } from "./view/schema";
import { schema as viewFileSchema } from "./view-file/schema";
import { schema as promptSchema } from "./prompt/schema";
import { schema as promptVersionSchema } from "./prompt-version/schema";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { onUpload } from "../storage/on-upload/resource";
import { customAuthorizer } from "./custom-authorizer/resource";

const schema = a.schema({ // todo update required fields
  User: a
    .model({
      email: a.email(),
      accountId: a.id().required().authorization(allow => [allow.owner().to(["read", "delete"]), allow.authenticated().to(["read"])]),
      owner: a.string().authorization(allow => [allow.owner().to(["read", "delete"]), allow.authenticated().to(["read"])]),

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
      //allow.authenticated().to(["read"]) // todo update permissions "identityPool"
    ]),
  /* Size: a.enum([
     "SMALL",
     "MEDIUM",
     "LARGE",
   ]),*/
  ProjectFile: a.model({
    //id: a.id().required(), //.default(crypto.randomUUID()),
    projectId: a.id().required(),
    fileId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
    file: a.belongsTo("File", "fileId"),
    //    size: a.ref("Size").required(),
  })
    .identifier(["projectId", "fileId"])
    .secondaryIndexes((index) => [index("fileId").queryField("listProjectFilesByFileId")])
    .authorization((allow) => [allow.authenticated()]),
  Access: a.enum([
    "VIEW",
    "MANAGE"
  ]),
  ProjectMembership: a.model({
    accountId: a.id().required(),
    projectId: a.id().required(),
    user: a.belongsTo("User", "accountId"),
    project: a.belongsTo("Project", "projectId"),
    access: a.ref("Access").required(),
  })
    .identifier(["accountId", "projectId"]) // todo change order to optimize query performance
    .secondaryIndexes((index) => [index("projectId").queryField("listProjectMembershipsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),
  Project: a.model({
    name: a.string().required(),
    description: a.string(),

    files: a.hasMany("ProjectFile", "projectId"),
    //viewers: a.string().array(),
    //owner: a.string(),
    members: a.hasMany("ProjectMembership", "projectId"),

    // MARK: Author to Project one to many relationship
    authorId: a.id(),
    author: a.belongsTo("User", "authorId"),

    views: a.hasMany("View", "projectId"),
    prompts: a.hasMany("Prompt", "projectId"),

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
    owner: a.string().authorization(allow => [allow.owner().to(["read", "delete", "create"]), allow.authenticated().to(["read"])]), // todo might remove this field

    // MARK: Project to File one to many relationship
    projects: a.hasMany("ProjectFile", "fileId"),
    views: a.hasMany("ViewFile", "fileId"),

    // MARK: Author to File one to many relationship
    authorId: a.id(),
    author: a.belongsTo("User", "authorId"),

    //    meta: a.json(),
    //    contentType: a.string(),
  }).secondaryIndexes((index) => [
    index("path")
      .queryField("listFilesByPath")
  ])
    .authorization((allow) => [allow.authenticated()]),
  View: a.model({
    name: a.string().required(),
    description: a.string(),
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    files: a.hasMany("ViewFile", "viewId"),
  }).secondaryIndexes((index) => [index("projectId").queryField("listViewsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  ViewFile: a.model({
    viewId: a.id().required(),
    fileId: a.id().required(),
    view: a.belongsTo("View", "viewId"),
    file: a.belongsTo("File", "fileId"),
  })
    .identifier(["viewId", "fileId"])
    .secondaryIndexes((index) => [index("fileId").queryField("listViewFilesByFileId")])
    .authorization((allow) => [allow.authenticated()]),

  Prompt: a.model({
    summary: a.string(),
    description: a.string(),
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
    activeVersion: a.integer(),

    versions: a.hasMany("PromptVersion", "promptId"),
  }).secondaryIndexes((index) => [index("projectId").queryField("listPromptsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  PromptVersion: a.model({
    version: a.integer().required(),
    text: a.string().required(),
    promptId: a.id().required(),
    prompt: a.belongsTo("Prompt", "promptId"),

    categories: a.hasMany("Category", ["promptId", "version"]),
  }).identifier(["promptId", "version"])
    .secondaryIndexes((index) => [index("promptId")/*.sortKeys(["version"])*/.queryField("listPromptVersionsByPromptId")])
    .authorization((allow) => [allow.authenticated()]),

  Category: a.model({
    name: a.string().required(),
    description: a.string(),
    promptId: a.id().required(),
    version: a.integer().required(),
    promptVersion: a.belongsTo("PromptVersion", ["promptId", "version"]),
  })
    .secondaryIndexes((index) => [index("promptId")/*.sortKeys(["version"])*/.queryField("listCategoriesByPromptId")])
    .authorization((allow) => [allow.authenticated()]),

  Tester: a
    .model({
      content: a.string(),
    })
    // STEP 1
    // Indicate which models / fields should use a custom authorization rule
    .authorization(allow => [allow.custom()]), // des einmal löschen
}).authorization((allow) => [allow.resource(postConfirmation), allow.resource(onUpload), allow.resource(customAuthorizer)]);

export const combinedSchema = a.combine([schema, projectMembershipSchema, userSchema, fileSchema, projectSchema, projectViewSchema, viewFileSchema, promptSchema, promptVersionSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // todo may change to lambda and redeploy to resolve lambda custom authorizer token mapping issue
    lambdaAuthorizationMode: {
      function: customAuthorizer,
      // (Optional) STEP 3
      // Configure the token"s time to live
      timeToLiveInSeconds: 0,
    },
  },
});