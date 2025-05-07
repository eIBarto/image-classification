"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { z } from "zod";

//type returnType = Schema["getKrippendorffAlpha"]["returnType"]

export const schema = z.object({
    statusCode: z.number(),
    body: z.object({
        message: z.string()
    })
})

async function getKrippendorffAlpha(projectId: string, viewId: string) {
    const client = generateClient<Schema>();
    const { data, errors } = await client.queries.getKrippendorffAlpha({ projectId, viewId });

    if (errors) {
        console.error(`Failed to get krippendorff alpha: ${JSON.stringify(errors, null, 2)}`);
        throw new Error("Failed to get krippendorff alpha");
    }

    if (!data) {
        throw new Error("Failed to get krippendorff alpha");
    }

    return schema.parse(data);
}

export interface MainProps {
    projectId: string
    viewId: string
}

export function Main({ projectId, viewId }: MainProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["krippendorff-alpha", projectId, viewId],
        queryFn: () => getKrippendorffAlpha(projectId, viewId)
    })

    console.log(data)

    return (
        <div>
            <h1>Evaluation</h1>
            {data && (
                <div>
                    <h2>Krippendorff Alpha</h2>
                    <p>{data.body.message}</p>
                </div>
            )}
        </div>
    )
}