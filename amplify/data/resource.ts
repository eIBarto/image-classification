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
import { evaluationWrangler } from "../functions/evaluation-wrangler/resource";
import { getAnalytics } from "../functions/get-analytics/resource";

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
    .secondaryIndexes((index) => [index("projectId").queryField("listProjectMembershipsByProjectId"), index("accountId").queryField("listProjectMembershipsByAccountId")])
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

  }).authorization((allow) => [allow.authenticated()/*, allow.ownerDefinedIn("owner"), allow.ownersDefinedIn("viewers")allow.group("admin")*/]),
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
    //labels: a.hasMany("ViewLabel", "viewId"),
  }).secondaryIndexes((index) => [index("projectId").queryField("listViewsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  ViewFile: a.model({
    viewId: a.id().required(),
    fileId: a.id().required(),
    view: a.belongsTo("View", "viewId"),
    file: a.belongsTo("File", "fileId"),
    labelId: a.id(),
    label: a.belongsTo("Label", "labelId"),
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

    classifications: a.hasMany("Classification", "promptId"),
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

  //ViewLabel: a.model({
  //  viewId: a.id().required(),
  //  labelId: a.id().required(),
  //  view: a.belongsTo("View", "viewId"),
  //  label: a.belongsTo("Label", "labelId"),
  //})
  //  .identifier(["viewId", "labelId"])
  //  //.secondaryIndexes((index) => [index("viewId").queryField("listViewLabelsByViewId")])
  //  .authorization((allow) => [allow.authenticated()]),

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
    //views: a.hasMany("ViewLabel", "labelId"),
    promptVersions: a.hasMany("PromptVersionLabel", "labelId"),
    results: a.hasMany("Result", "labelId"),
    viewFiles: a.hasMany("ViewFile", "labelId"),
  })
    .secondaryIndexes((index) => [/*index("promptId").queryField("listLabelsByPromptId"),*/ index("projectId").queryField("listLabelsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  Classification: a.model({
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    viewId: a.id().required(), // unbedingt required weil hängt an view
    view: a.belongsTo("View", "viewId"),

    promptId: a.id().required(),
    prompt: a.belongsTo("Prompt", "promptId"),
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
  getRawData: a.query().arguments({
    projectId: a.id().required(),
    viewId: a.id().required(),
  }).returns(a.json()).handler(a.handler.function(evaluationWrangler)).authorization((allow) => [allow.authenticated()]),

  getAnalytics: a.query().arguments({
    projectId: a.id().required(),
    viewId: a.id().required(),
  }).returns(a.ref("LambdaAnalyticsOutput")).handler([a.handler.function(evaluationWrangler), a.handler.function(getAnalytics)]).authorization((allow) => [allow.authenticated()]),

  DataRow: a.customType({
    values: a.string().array().required()
  }),

  DataFrameStructured: a.customType({
    columns: a.string().array().required(),
    index: a.string().array().required(),
    data_rows: a.ref("DataRow").array().required()
  }),

  SeriesStructured: a.customType({
    name: a.string(),
    index: a.string().array().required(),
    data: a.string().array().required()
  }),

  PairwiseRunContingencyEntry: a.customType({
    compared_runs: a.string().required(),
    run_1_name: a.string().required(),
    run_2_name: a.string().required(),
    contingency_matrix: a.ref("DataFrameStructured")
  }),

  DataOverview: a.customType({
    overview_annotations_wide: a.ref("DataFrameStructured"),
    annotations_long_format: a.ref("DataFrameStructured"),
    inter_coder_contingency_matrix: a.ref("DataFrameStructured"),
    majority_decision_annotations: a.ref("SeriesStructured"),
    gold_standard_labels: a.ref("DataFrameStructured"),
    combined_comparison_table: a.ref("DataFrameStructured"),
    pairwise_run_contingency_matrices: a.ref("PairwiseRunContingencyEntry").array()
  }),

  CohensKappaOutput: a.customType({
    majority_vs_gold: a.ref("DataFrameStructured"),
    between_annotation_runs: a.ref("DataFrameStructured")
  }),

  InterRaterReliability: a.customType({
    krippendorff_alpha: a.float(),
    cohens_kappa: a.ref("CohensKappaOutput")
  }),

  PerClassMetricValues: a.customType({
    precision: a.float(),
    recall: a.float(),
    f_1_score: a.float(),
    support: a.integer()
  }),

  // Key 'className' changed to 'label_name'
  PerClassPerformanceEntry: a.customType({
    label_name: a.string().required(), // Changed from className
    metrics: a.ref("PerClassMetricValues").required()
  }),

  SingleModelEvaluationResult: a.customType({
    metrics_summary: a.ref("DataFrameStructured").required(),
    per_class_metrics: a.ref("PerClassPerformanceEntry").array().required(),
    confusion_matrix: a.ref("DataFrameStructured").required(),
    log_messages: a.string().array().required()
  }),

  AnnotationRunEvaluationResult: a.customType({
    annotation_run_name: a.string().required(),
    metrics_summary: a.ref("DataFrameStructured").required(),
    per_class_metrics: a.ref("PerClassPerformanceEntry").array().required(),
    confusion_matrix: a.ref("DataFrameStructured").required(),
    log_messages: a.string().array().required()
  }),

  ModelEvaluations: a.customType({
    majority_decision_vs_gold_standard: a.ref("SingleModelEvaluationResult"),
    annotation_runs_vs_gold_standard: a.ref("AnnotationRunEvaluationResult").array()
  }),

  LambdaAnalyticsOutput: a.customType({
    data_overview: a.ref("DataOverview"),
    inter_rater_reliability: a.ref("InterRaterReliability"),
    model_evaluations: a.ref("ModelEvaluations"),
    logs: a.string().array().required()
  })

}).authorization((allow) => [allow.resource(getAnalytics), allow.resource(evaluationWrangler), allow.resource(postConfirmation), allow.resource(onUpload)]);

export const combinedSchema = a.combine([schema, projectMembershipSchema, userSchema, fileSchema, projectSchema, projectViewSchema, viewFileSchema, promptSchema, promptVersionSchema, classificationSchema, classificationCandidateSchema, labelSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // todo may change to lambda and redeploy to resolve lambda custom authorizer token mapping issue
    //lambdaAuthorizationMode: {
    //  //function: customAuthorizer,
    //  // (Optional) STEP 3
    //  // Configure the token"s time to live
    //  timeToLiveInSeconds: 0,
    //},
  },
});