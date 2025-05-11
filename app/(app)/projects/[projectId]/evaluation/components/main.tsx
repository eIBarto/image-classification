"use client"

import { KrippendorffAlpha } from "./krippendorff-alpha"
import { ConfusionMatrix } from "./confusion-matrix"

export interface MainProps {
    projectId: string
    viewId: string
}

export function Main({ projectId, viewId }: MainProps) {
    

    return (
        <div>
            <h1>Evaluation</h1>
            <KrippendorffAlpha projectId={projectId} viewId={viewId} />
            <ConfusionMatrix projectId={projectId} viewId={viewId} />
        </div>
    )
}