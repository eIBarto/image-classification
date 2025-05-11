"use client"

import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner"


export const confusionMatrixResultSchema = z.object({
    classification_evaluations: z.array(z.object({
        classification_name: z.string(),
        classification_id: z.string(),
        confusion_matrix: z.object({
            labels: z.array(z.string()),
            matrix_values: z.array(z.array(z.number()))
        }),
        metrics_summary: z.array(z.object({
            category: z.string(),
            metrics: z.object({
                accuracy_class_vs_rest: z.number(),
                accuracy: z.number(),
                precision: z.number(),
                recall: z.number(),
                f1_score: z.number(),
                support: z.number()
            })
        })),
        status_notes: z.array(z.string())
    })),
    global_processing_notes: z.array(z.string()),
    global_warnings: z.array(z.string())
}) 


async function getConfusionMatrix(projectId: string, viewId: string) {
    const client = generateClient<Schema>();
    const { data, errors } = await client.queries.getConfusionMatrix({ projectId, viewId });

    if (errors) {
        console.error(`Failed to get confusion matrix: ${JSON.stringify(errors, null, 2)}`);
        throw new Error("Failed to get confusion matrix");
    }

    if (!data) {
        throw new Error("Failed to get confusion matrix");
    }

    return confusionMatrixResultSchema.parse(data);
}


export interface ConfusionMatrixProps {
    projectId: string
    viewId: string
}

export function ConfusionMatrix({ projectId, viewId }: ConfusionMatrixProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["confusion-matrix", projectId, viewId],
        queryFn: () => getConfusionMatrix(projectId, viewId)
    })

    console.log(data)
    console.log(isLoading)

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to get confusion matrix")
        }
    }, [error])

    return (
        <div>
            <h1>Evaluation</h1>
            {data && (
                <div>
                    <h2>Confusion Matrix</h2>
                    <p>{JSON.stringify(data, null, 2)}</p>
                </div>
            )}
        </div>
    )
}