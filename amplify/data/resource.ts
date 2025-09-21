// Amplify data schema combining core domain models and analytics queries
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

const schema = a.schema({
  User: a
    .model({
      email: a.email(),
      accountId: a.id().required().authorization(allow => [allow.owner().to(["read", "delete"]), allow.authenticated().to(["read"])]),
      owner: a.string().authorization(allow => [allow.owner().to(["read", "delete"]), allow.authenticated().to(["read"])]),

      memberships: a.hasMany("ProjectMembership", "accountId"),
      projects: a.hasMany("Project", "authorId"),
      files: a.hasMany("File", "authorId"),

    }).identifier(["accountId"])

    .authorization((allow) => [
      allow.ownerDefinedIn("owner"),

    ]),

  ProjectFile: a.model({

    projectId: a.id().required(),
    fileId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),
    file: a.belongsTo("File", "fileId"),

  })
    .identifier(["projectId", "fileId"])
    .secondaryIndexes((index) => [index("fileId").queryField("listProjectFilesByFileId")])
    .authorization((allow) => [allow.authenticated()]),
  // Project-level access roles
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
    .identifier(["accountId", "projectId"])
    .secondaryIndexes((index) => [index("projectId").queryField("listProjectMembershipsByProjectId"), index("accountId").queryField("listProjectMembershipsByAccountId")])
    .authorization((allow) => [allow.authenticated()]),
  Project: a.model({
    name: a.string().required(),
    description: a.string(),

    files: a.hasMany("ProjectFile", "projectId"),

    members: a.hasMany("ProjectMembership", "projectId"),
    labels: a.hasMany("Label", "projectId"),

    authorId: a.id(),
    author: a.belongsTo("User", "authorId"),

    views: a.hasMany("View", "projectId"),
    prompts: a.hasMany("Prompt", "projectId"),
    classifications: a.hasMany("Classification", "projectId"),

  }).authorization((allow) => [allow.authenticated()]),

  File: a.model({
    path: a.string().required(),
    name: a.string().required(),

    owner: a.string().authorization(allow => [allow.owner().to(["read", "delete", "create"]), allow.authenticated().to(["read"])]),

    projects: a.hasMany("ProjectFile", "fileId"),
    views: a.hasMany("ViewFile", "fileId"),

    authorId: a.id(),
    author: a.belongsTo("User", "authorId"),

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

    .authorization((allow) => [allow.authenticated()]),

  Label: a.model({
    name: a.string().required(),
    description: a.string().required(),

    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    prompts: a.hasMany("PromptLabel", "labelId"),

    promptVersions: a.hasMany("PromptVersionLabel", "labelId"),
    results: a.hasMany("Result", "labelId"),
    viewFiles: a.hasMany("ViewFile", "labelId"),
  })
    .secondaryIndexes((index) => [ index("projectId").queryField("listLabelsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  Classification: a.model({
    projectId: a.id().required(),
    project: a.belongsTo("Project", "projectId"),

    viewId: a.id().required(),
    view: a.belongsTo("View", "viewId"),

    promptId: a.id().required(),
    prompt: a.belongsTo("Prompt", "promptId"),
    version: a.string().required(),
    promptVersion: a.belongsTo("PromptVersion", ["promptId", "version"]),

    name: a.string().required(),
    description: a.string(),

    model: a.string().default("GEMINI_2"),
    temperature: a.float().required(),
    topP: a.float().required(),
    maxLength: a.integer().required(),

    results: a.hasMany("Result", "classificationId")
  })
    .secondaryIndexes((index) => [index("projectId").queryField("listClassificationsByProjectId")])
    .authorization((allow) => [allow.authenticated()]),

  Result: a.model({
    classificationId: a.id().required(),
    classification: a.belongsTo("Classification", "classificationId"),

    fileId: a.id().required(),
    file: a.belongsTo("File", "fileId"),

    labelId: a.id().required(),
    label: a.belongsTo("Label", "labelId"),

    confidence: a.float().required(),
  })
    .secondaryIndexes((index) => [index("classificationId").queryField("listResultsByClassificationId")])

    .authorization((allow) => [allow.authenticated()]),
  // Query for fetching raw data used by the analytics pipeline
  getRawData: a.query().arguments({
    projectId: a.id().required(),
    viewId: a.id().required(),
  }).returns(a.json()).handler(a.handler.function(evaluationWrangler)).authorization((allow) => [allow.authenticated()]),

  // Main analytics query; chained TS → Python function for metrics
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

  PerClassPerformanceEntry: a.customType({
    label_name: a.string().required(),
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
    defaultAuthorizationMode: "userPool",

  },
});