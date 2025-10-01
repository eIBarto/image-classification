"use client"
/** Columns for SeriesStructuredTable (index + value) */

import type { ColumnDef } from "@tanstack/react-table"
import type { SeriesDisplayRow } from "../types"

export const seriesStructuredTableColumns: ColumnDef<SeriesDisplayRow>[] = [
  {
    accessorKey: "index",
    header: "Index",
    cell: ({ row }) => row.original.index ?? "N/A",
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => row.original.data ?? "N/A",
  },
]