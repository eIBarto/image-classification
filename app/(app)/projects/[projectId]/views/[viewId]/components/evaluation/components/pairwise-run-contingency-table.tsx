"use client"
/**
 * Pairwise run contingency view: shows cross-tab for two runs
 */

import type { PairwiseRunContingencyEntry } from "../types"
import { DataFrameTable } from "./data-frame-table"

interface PairwiseRunContingencyTableProps {
  entry: PairwiseRunContingencyEntry | null | undefined
}

export function PairwiseRunContingencyTable({ entry }: PairwiseRunContingencyTableProps) {
  if (!entry) {
    return <p>No pairwise run contingency data available.</p>
  }

  const { compared_runs, run_1_name, run_2_name, contingency_matrix } = entry

  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold mb-1">
        {compared_runs ?? `Comparison between ${run_1_name ?? 'Run 1'} and ${run_2_name ?? 'Run 2'}`}
      </h4>
      {run_1_name && run_2_name && (
        <p className="text-sm text-muted-foreground mb-2">
          Run 1: {run_1_name}, Run 2: {run_2_name}
        </p>
      )}
      <DataFrameTable title="Contingency Matrix" dataFrame={contingency_matrix} />
    </div>
  )
}