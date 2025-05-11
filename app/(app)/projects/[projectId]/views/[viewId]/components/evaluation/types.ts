import { z } from 'zod';

// DataRow
const DataRowSchema = z.object({
  values: z.array(z.string().nullable()).describe("Array of cell values (strings, or null if original was NaN)"),
});
export type DataRow = z.infer<typeof DataRowSchema>;

// DataFrameStructured
export const DataFrameStructuredSchema = z.object({
  columns: z.array(z.string().nullable()),
  index: z.array(z.string().nullable()),
  data_rows: z.array(DataRowSchema),
});
export type DataFrameStructured = z.infer<typeof DataFrameStructuredSchema>;

// SeriesStructured
export const SeriesStructuredSchema = z.object({
  name: z.string().nullable().optional(),
  index: z.array(z.string().nullable()),
  data: z.array(z.string().nullable()).describe("Array of strings (or nulls)"),
});
export type SeriesStructured = z.infer<typeof SeriesStructuredSchema>;

// PairwiseRunContingencyEntry
export const PairwiseRunContingencyEntrySchema = z.object({
  compared_runs: z.string().nullable(),
  run_1_name: z.string().nullable(),
  run_2_name: z.string().nullable(),
  contingency_matrix: DataFrameStructuredSchema.nullable().optional(),
});
export type PairwiseRunContingencyEntry = z.infer<typeof PairwiseRunContingencyEntrySchema>;

// DataOverview
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

// CohensKappaOutput
export const CohensKappaOutputSchema = z.object({
  majority_vs_gold: DataFrameStructuredSchema.nullable().optional(),
  between_annotation_runs: DataFrameStructuredSchema.nullable().optional(),
});
export type CohensKappaOutput = z.infer<typeof CohensKappaOutputSchema>;

// InterRaterReliability
export const InterRaterReliabilitySchema = z.object({
  krippendorff_alpha: z.number().nullable().optional(),
  cohens_kappa: CohensKappaOutputSchema.nullable().optional(),
});
export type InterRaterReliability = z.infer<typeof InterRaterReliabilitySchema>;

export const PerClassMetricValuesSchema = z.object({
  precision: z.number().nullable(),
  recall: z.number().nullable(),
  f_1_score: z.number().nullable(), // f-1_score in python, but f_1_score in zod/ts
  support: z.number().nullable(),
});
export type PerClassMetricValues = z.infer<typeof PerClassMetricValuesSchema>;

// Key 'className' changed to 'label_name'
export const PerClassPerformanceEntrySchema = z.object({
  label_name: z.string().nullable(), // Changed from className
  metrics: PerClassMetricValuesSchema.nullable(),
});
export type PerClassPerformanceEntry = z.infer<typeof PerClassPerformanceEntrySchema>;

// SingleModelEvaluationResult - Updated
export const SingleModelEvaluationResultSchema = z.object({
  metrics_summary: DataFrameStructuredSchema.nullable(),
  per_class_metrics: z.array(PerClassPerformanceEntrySchema), // Added
  confusion_matrix: DataFrameStructuredSchema.nullable(),
  log_messages: z.array(z.string().nullable()),
});
export type SingleModelEvaluationResult = z.infer<typeof SingleModelEvaluationResultSchema>;

// AnnotationRunEvaluationResult - Updated
export const AnnotationRunEvaluationResultSchema = z.object({
  annotation_run_name: z.string().nullable(),
  metrics_summary: DataFrameStructuredSchema.nullable(),
  per_class_metrics: z.array(PerClassPerformanceEntrySchema), // Added
  confusion_matrix: DataFrameStructuredSchema.nullable(),
  log_messages: z.array(z.string().nullable()),
});
export type AnnotationRunEvaluationResult = z.infer<typeof AnnotationRunEvaluationResultSchema>;

// ModelEvaluations
export const ModelEvaluationsSchema = z.object({
  majority_decision_vs_gold_standard: SingleModelEvaluationResultSchema.nullable().optional(),
  annotation_runs_vs_gold_standard: z.array(AnnotationRunEvaluationResultSchema).nullable().optional(),
});
export type ModelEvaluations = z.infer<typeof ModelEvaluationsSchema>;

// LambdaAnalyticsOutput
export const LambdaAnalyticsOutputSchema = z.object({
  data_overview: DataOverviewSchema.nullable().optional(),
  inter_rater_reliability: InterRaterReliabilitySchema.nullable().optional(),
  model_evaluations: ModelEvaluationsSchema.nullable().optional(),
  logs: z.array(z.string().nullable()),
});
export type LambdaAnalyticsOutput = z.infer<typeof LambdaAnalyticsOutputSchema>;

// Helper type for TanStack Table rows derived from DataFrameStructured
// Each key will correspond to a column header, and the value will be the cell's value.
export type DataFrameDisplayRow = { [key: string]: string | null };

// Helper type for TanStack Table rows derived from SeriesStructured
export type SeriesDisplayRow = {
  index: string | null; // Corresponds to accessorKey "index"
  data: string | null;  // Corresponds to accessorKey "data"
};