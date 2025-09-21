"use client"
/**
 * Evaluation results UI
 * - Renders data frames/series and metrics produced by analytics Lambdas
 * - Keeps rendering defensive: handle empty/partial data gracefully
 */

import { useQuery } from "@tanstack/react-query"
import { LambdaAnalyticsOutputSchema } from "./types"
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner"
import { generateClient } from 'aws-amplify/data';
import { useEffect, useState } from "react";
import { DataFrameTable } from "./components/data-frame-table";
import { SeriesStructuredTable } from "./components/series-structured-table";
import { PairwiseRunContingencyTable } from "./components/pairwise-run-contingency-table";
import { PerClassMetricsTable } from "./components/per-class-metrics-table";
import { ConfusionMatrixTable } from "./components/confusion-matrix-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRightIcon } from "lucide-react";

const client = generateClient<Schema>()

async function getAnalytics(projectId: string, viewId: string) {
    const { data, errors } = await client.queries.getAnalytics({ projectId, viewId })

    if (errors) {
        console.error("Error fetching analytics:", errors)
        throw new Error("Error fetching analytics")
    }

    if (!data) {
        console.error("No data returned from analytics")
        throw new Error("No data returned from analytics")
    }

    return LambdaAnalyticsOutputSchema.parse(data)
}

export interface EvaluationResultsProps {
    projectId: string;
    viewId: string;
}

export default function EvaluationResults({ projectId, viewId }: EvaluationResultsProps) {
    const { data, error, isLoading } = useQuery({
        queryKey: ["analytics", projectId, viewId],
        queryFn: () => getAnalytics(projectId, viewId),
    })

    const [selectedRunIndex, setSelectedRunIndex] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            toast.error("Error fetching analytics: " + error.message)
            console.error("Error fetching analytics:", error)
        }
    }, [error])

    useEffect(() => {
        if (data?.model_evaluations?.annotation_runs_vs_gold_standard && data.model_evaluations.annotation_runs_vs_gold_standard.length > 0) {
            setSelectedRunIndex("0");
        }
    }, [data?.model_evaluations?.annotation_runs_vs_gold_standard]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 border border-red-500 rounded-md">
                <p>Error fetching evaluation results: {error.message}</p>
            </div>
        )
    }

    if (!data) {
        return <p>No evaluation data available.</p>
    }

    const { data_overview, inter_rater_reliability, model_evaluations, logs } = data;

    return (
        <div className="space-y-8">
            {logs && logs.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-3">Logs</h2>
                    <div className="p-3 bg-muted rounded-md max-h-48 overflow-y-auto">
                        {logs.map((log, i) => (
                            <p key={`log-${i}`} className="text-sm font-mono">{log ?? "N/A"}</p>
                        ))}
                    </div>
                </div>
            )}

            {data_overview && (
                <section>
                    <h2 className="text-xl font-semibold mb-3">Data Overview</h2>
                    <DataFrameTable title="Inter-coder Contingency Matrix" dataFrame={data_overview.inter_coder_contingency_matrix} />
                    <SeriesStructuredTable title="Majority Decision Annotations" seriesData={data_overview.majority_decision_annotations} />
                    <DataFrameTable title="Gold Standard Labels" dataFrame={data_overview.gold_standard_labels} />
                    <DataFrameTable title="Combined Comparison Table" dataFrame={data_overview.combined_comparison_table} />

                    <Collapsible defaultOpen={false} className="group/collapsible">
                        <CollapsibleTrigger className="flex items-center w-full text-left">
                            <h3 className="text-lg font-semibold mb-2 flex-grow">Annotations</h3>
                            <ChevronRightIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Tabs defaultValue="overview-annotations-wide" className="mt-2">
                                <TabsList className="mb-2">
                                    <TabsTrigger value="overview-annotations-wide">Overview Annotations Wide</TabsTrigger>
                                    <TabsTrigger value="annotations-long-format">Annotations Long Format</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview-annotations-wide">
                                    <DataFrameTable title="Overview Annotations Wide" dataFrame={data_overview.overview_annotations_wide} />
                                </TabsContent>
                                <TabsContent value="annotations-long-format">
                                    <DataFrameTable title="Annotations Long Format" dataFrame={data_overview.annotations_long_format} />

                                </TabsContent>
                            </Tabs>
                        </CollapsibleContent>
                    </Collapsible>

                    {data_overview.pairwise_run_contingency_matrices && (
                        <Collapsible defaultOpen={false} className="group/collapsible">
                            <CollapsibleTrigger className="flex items-center w-full text-left">
                                <h3 className="text-lg font-semibold mb-2 flex-grow">Pairwise Run Contingency Matrices</h3>
                                <ChevronRightIcon className="h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="mt-2 space-y-3">
                                    {data_overview.pairwise_run_contingency_matrices.map((entry, i) => (
                                        <PairwiseRunContingencyTable key={`pairwise-${i}`} entry={entry} />
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </section>
            )}

            {inter_rater_reliability && (
                <section>
                    <h2 className="text-xl font-semibold mb-3">Inter-Rater Reliability</h2>
                    {inter_rater_reliability.krippendorff_alpha !== undefined && (
                        <p className="mb-2">Krippendorff Alpha: {inter_rater_reliability.krippendorff_alpha ?? 'N/A'}</p>
                    )}
                    {inter_rater_reliability.cohens_kappa && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Cohen&apos;s Kappa</h3>
                            <DataFrameTable title="Majority vs Gold Standard" dataFrame={inter_rater_reliability.cohens_kappa.majority_vs_gold} />
                            <DataFrameTable title="Between Annotation Runs" dataFrame={inter_rater_reliability.cohens_kappa.between_annotation_runs} />
                        </div>
                    )}
                </section>
            )}

            {model_evaluations && (
                <section>
                    <h2 className="text-xl font-semibold mb-3">Model Evaluations</h2>
                    {model_evaluations.majority_decision_vs_gold_standard && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Majority Decision vs Gold Standard</h3>
                            <DataFrameTable title="Metrics Summary" dataFrame={model_evaluations.majority_decision_vs_gold_standard.metrics_summary} />
                            {model_evaluations.majority_decision_vs_gold_standard.per_class_metrics &&
                                model_evaluations.majority_decision_vs_gold_standard.per_class_metrics.length > 0 && (
                                <PerClassMetricsTable title="Per-Class Metrics" data={model_evaluations.majority_decision_vs_gold_standard.per_class_metrics} />
                            )}
                            <ConfusionMatrixTable title="Confusion Matrix" dataFrame={model_evaluations.majority_decision_vs_gold_standard.confusion_matrix} />
                            {model_evaluations.majority_decision_vs_gold_standard.log_messages && model_evaluations.majority_decision_vs_gold_standard.log_messages.length > 0 && (
                                <div className="mt-2">
                                    <h4 className="text-md font-semibold">Log Messages:</h4>
                                    <div className="p-2 bg-muted rounded-md max-h-32 overflow-y-auto">
                                        {model_evaluations.majority_decision_vs_gold_standard.log_messages.map((log, i) => (
                                            <p key={`log-majority-${i}`} className="text-sm font-mono">{log ?? "N/A"}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {model_evaluations.annotation_runs_vs_gold_standard && model_evaluations.annotation_runs_vs_gold_standard.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Annotation Runs vs Gold Standard</h3>
                            <Select
                                value={selectedRunIndex ?? undefined}
                                onValueChange={(value) => setSelectedRunIndex(value)}
                            >
                                <SelectTrigger className="w-[280px] mb-4">
                                    <SelectValue placeholder="Select an annotation run" />
                                </SelectTrigger>
                                <SelectContent>
                                    {model_evaluations.annotation_runs_vs_gold_standard.map((run_eval, i) => (
                                        <SelectItem key={`select-run-${i}`} value={String(i)}>
                                            {run_eval.annotation_run_name ?? `Annotation Run ${i + 1}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedRunIndex !== null && model_evaluations.annotation_runs_vs_gold_standard[parseInt(selectedRunIndex)] && (() => {
                                const run_eval = model_evaluations.annotation_runs_vs_gold_standard[parseInt(selectedRunIndex)];
                                return (
                                    <div key={`run-eval-${selectedRunIndex}`} className="mb-4 p-3 border rounded-md">
                                        <DataFrameTable title="Metrics Summary" dataFrame={run_eval.metrics_summary} />
                                        {run_eval.per_class_metrics && run_eval.per_class_metrics.length > 0 && (
                                            <PerClassMetricsTable title="Per-Class Metrics" data={run_eval.per_class_metrics} />
                                        )}
                                        <ConfusionMatrixTable title="Confusion Matrix" dataFrame={run_eval.confusion_matrix} />
                                        {run_eval.log_messages && run_eval.log_messages.length > 0 && (
                                            <div className="mt-2">
                                                <h5 className="text-sm font-semibold">Log Messages:</h5>
                                                <div className="p-2 bg-muted rounded-md max-h-32 overflow-y-auto">
                                                    {run_eval.log_messages.map((log, j) => (
                                                        <p key={`log-run-${selectedRunIndex}-${j}`} className="text-xs font-mono">{log ?? "N/A"}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}