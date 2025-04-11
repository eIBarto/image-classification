import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { schema as projectMembershipSchema } from "./project-membership/schema";
import { schema as userSchema } from "./user/schema";
import { schema as fileSchema } from "./project-file/schema";
import { schema as projectSchema } from "./project/schema";
import { schema as projectViewSchema } from "./view/schema";
import { schema as viewFileSchema } from "./view-file/schema";
import { schema as promptSchema } from "./prompt/schema";
import { schema as promptVersionSchema } from "./prompt-version/schema";
import { schema as classificationSchema } from "./classification/schema";
import { schema as classificationCandidateSchema } from "./classification-candidate/schema";
import { schema as labelSchema } from "./label/schema";
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
    labels: a.hasMany("Label", "projectId"),

    // MARK: Author to Project one to many relationship
    authorId: a.id(),
    author: a.belongsTo("User", "authorId"),

    views: a.hasMany("View", "projectId"),
    prompts: a.hasMany("Prompt", "projectId"),
    classifications: a.hasMany("Classification", "projectId"),

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
    results: a.hasMany("Result", "fileId"),
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
    classifications: a.hasMany("Classification", "viewId"),
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
    activeVersion: a.string(),
    labels: a.hasMany("PromptLabel", "promptId"),

    versions: a.hasMany("PromptVersion", "promptId"),
  }).secondaryIndexes((index) => [index("projectId").queryField("listPromptsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  PromptVersionLabel: a.model({
    promptId: a.id().required(),
    version: a.string().required(),
    labelId: a.id().required(),

    promptVersion: a.belongsTo('PromptVersion', ['promptId', 'version']),
    label: a.belongsTo('Label', 'labelId'),
  })
    .identifier(['promptId', 'version', 'labelId'])
    //.secondaryIndexes((index) => [index("labelId").queryField("listPromptVersionLabelsByLabelId")])
    .authorization((allow) => [allow.authenticated()]),

  PromptVersion: a.model({
    version: a.string().required(),
    text: a.string().required(),
    promptId: a.id().required(),
    prompt: a.belongsTo("Prompt", "promptId"),

    labels: a.hasMany("PromptVersionLabel", ["promptId", "version"]),
    classifications: a.hasMany("Classification", ["promptId", "version"]),
  }).identifier(["promptId", "version"])
    .secondaryIndexes((index) => [index("promptId").queryField("listPromptVersionsByPromptId")])
    .authorization((allow) => [allow.authenticated()]),

  PromptLabel: a.model({
    promptId: a.id().required(),
    labelId: a.id().required(),
    prompt: a.belongsTo("Prompt", "promptId"),
    label: a.belongsTo("Label", "labelId"),
  })
    .identifier(["promptId", "labelId"])
    //.secondaryIndexes((index) => [index("promptId").queryField("listPromptLabelsByPromptId")])
    .authorization((allow) => [allow.authenticated()]),

  Label: a.model({
    name: a.string().required(),
    description: a.string().required(),
    //promptId: a.id().required(),
    //prompt: a.belongsTo("Prompt", "promptId"),
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
    //version: a.string().required(),

    prompts: a.hasMany("PromptLabel", "labelId"),
    promptVersions: a.hasMany("PromptVersionLabel", "labelId"),
    results: a.hasMany("Result", "labelId"),
  })
    .secondaryIndexes((index) => [/*index("promptId").queryField("listLabelsByPromptId"),*/ index("projectId").queryField("listLabelsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  Classification: a.model({
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    viewId: a.id().required(), // unbedingt required weil hängt an view
    view: a.belongsTo("View", "viewId"),

    promptId: a.id().required(),
    //prompt: a.belongsTo("Prompt", "promptId"),
    version: a.string().required(),
    promptVersion: a.belongsTo("PromptVersion", ["promptId", "version"]),

    // todo alternatively relate to prompt

    name: a.string().required(),
    description: a.string(),

    results: a.hasMany("Result", "classificationId")
  })//.identifier(["projectId", "viewId", "promptId", "version"]) // todo may use composite key [projectId, viewId, (promptId, version)]
    .secondaryIndexes((index) => [index("projectId").queryField("listClassificationsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  /*ClassificationFile: a.model({
    classificationId: a.id().required(), // implies hasMany from Classification
    classification: a.belongsTo("Classification", "classificationId"),

    fileId: a.id().required(), // file oder viewFile implies hasMany from File (or ViewFile)
    file: a.belongsTo("File", "fileId"), 

    labelId: a.id()//.required(), // or hasOne to hasMany from Label
    label: a.belongsTo("Label", "labelId"),
  })*/


  Result: a.model({
    classificationId: a.id().required(),
    classification: a.belongsTo("Classification", "classificationId"),

    fileId: a.id().required(), // file oder viewFile
    file: a.belongsTo("File", "fileId"),

    labelId: a.id().required(),
    label: a.belongsTo("Label", "labelId"),

    confidence: a.float().required(),
  })//.identifier(["classificationId", "fileId", "labelId"]) todo may use composite key
    .secondaryIndexes((index) => [index("classificationId").queryField("listResultsByClassificationId")])
    //.secondaryIndexes((index) => [index("promptId")/*.sortKeys(["version"])*/.queryField("listCategoriesByPromptId")])
    .authorization((allow) => [allow.authenticated()]),

}).authorization((allow) => [allow.resource(postConfirmation), allow.resource(onUpload), allow.resource(customAuthorizer)]);

export const combinedSchema = a.combine([schema, projectMembershipSchema, userSchema, fileSchema, projectSchema, projectViewSchema, viewFileSchema, promptSchema, promptVersionSchema, classificationSchema, classificationCandidateSchema, labelSchema]);

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