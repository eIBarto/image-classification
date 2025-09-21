import { z } from 'zod';

const DataRowSchema = z.object({
  values: z.array(z.string().nullable()).describe("Array of cell values (strings, or null if original was NaN)"),
});
export type DataRow = z.infer<typeof DataRowSchema>;

export const DataFrameStructuredSchema = z.object({
  columns: z.array(z.string().nullable()),
  index: z.array(z.string().nullable()),
  data_rows: z.array(DataRowSchema),
});
export type DataFrameStructured = z.infer<typeof DataFrameStructuredSchema>;

export const SeriesStructuredSchema = z.object({
  name: z.string().nullable().optional(),
  index: z.array(z.string().nullable()),
  data: z.array(z.string().nullable()).describe("Array of strings (or nulls)"),
});
export type SeriesStructured = z.infer<typeof SeriesStructuredSchema>;

export const PairwiseRunContingencyEntrySchema = z.object({
  compared_runs: z.string().nullable(),
  run_1_name: z.string().nullable(),
  run_2_name: z.string().nullable(),
  contingency_matrix: DataFrameStructuredSchema.nullable().optional(),
});
export type PairwiseRunContingencyEntry = z.infer<typeof PairwiseRunContingencyEntrySchema>;

export const DataOverviewSchema = z.object({
  overview_annotations_wide: DataFrameStructuredSchema.nullable().optional(),
  annotations_long_format: DataFrameStructuredSchema.nullable().optional(),
  inter_coder_contingency_matrix: DataFrameStructuredSchema.nullable().optional(),
  majority_decision_annotations: SeriesStructuredSchema.nullable().optional(),
  gold_standard_labels: DataFrameStructuredSchema.nullable().optional(),
  combined_comparison_table: DataFrameStructuredSchema.nullable().optional(),
  pairwise_run_contingency_matrices: z.array(PairwiseRunContingencyEntrySchema).nullable().optional(),
});
export type DataOverview = z.infer<typeof DataOverviewSchema>;

export const CohensKappaOutputSchema = z.object({
  majority_vs_gold: DataFrameStructuredSchema.nullable().optional(),
  between_annotation_runs: DataFrameStructuredSchema.nullable().optional(),
});
export type CohensKappaOutput = z.infer<typeof CohensKappaOutputSchema>;

export const InterRaterReliabilitySchema = z.object({
  krippendorff_alpha: z.number().nullable().optional(),
  cohens_kappa: CohensKappaOutputSchema.nullable().optional(),
});
export type InterRaterReliability = z.infer<typeof InterRaterReliabilitySchema>;

export const PerClassMetricValuesSchema = z.object({
  precision: z.number().nullable(),
  recall: z.number().nullable(),
  f_1_score: z.number().nullable(),
  support: z.number().nullable(),
});
export type PerClassMetricValues = z.infer<typeof PerClassMetricValuesSchema>;

export const PerClassPerformanceEntrySchema = z.object({
  label_name: z.string().nullable(),
  metrics: PerClassMetricValuesSchema.nullable(),
});
export type PerClassPerformanceEntry = z.infer<typeof PerClassPerformanceEntrySchema>;

export const SingleModelEvaluationResultSchema = z.object({
  metrics_summary: DataFrameStructuredSchema.nullable(),
  per_class_metrics: z.array(PerClassPerformanceEntrySchema),
  confusion_matrix: DataFrameStructuredSchema.nullable(),
  log_messages: z.array(z.string().nullable()),
});
export type SingleModelEvaluationResult = z.infer<typeof SingleModelEvaluationResultSchema>;

export const AnnotationRunEvaluationResultSchema = z.object({
  annotation_run_name: z.string().nullable(),
  metrics_summary: DataFrameStructuredSchema.nullable(),
  per_class_metrics: z.array(PerClassPerformanceEntrySchema),
  confusion_matrix: DataFrameStructuredSchema.nullable(),
  log_messages: z.array(z.string().nullable()),
});
export type AnnotationRunEvaluationResult = z.infer<typeof AnnotationRunEvaluationResultSchema>;

export const ModelEvaluationsSchema = z.object({
  majority_decision_vs_gold_standard: SingleModelEvaluationResultSchema.nullable().optional(),
  annotation_runs_vs_gold_standard: z.array(AnnotationRunEvaluationResultSchema).nullable().optional(),
});
export type ModelEvaluations = z.infer<typeof ModelEvaluationsSchema>;

export const LambdaAnalyticsOutputSchema = z.object({
  data_overview: DataOverviewSchema.nullable().optional(),
  inter_rater_reliability: InterRaterReliabilitySchema.nullable().optional(),
  model_evaluations: ModelEvaluationsSchema.nullable().optional(),
  logs: z.array(z.string().nullable()),
});
export type LambdaAnalyticsOutput = z.infer<typeof LambdaAnalyticsOutputSchema>;

export type DataFrameDisplayRow = { [key: string]: string | null };

export type SeriesDisplayRow = {
  index: string | null;
  data: string | null;
};