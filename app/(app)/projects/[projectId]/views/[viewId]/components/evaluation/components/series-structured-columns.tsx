"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { SeriesDisplayRow } from "../types"

export const seriesStructuredTableColumns: ColumnDef<SeriesDisplayRow>[] = [
  {
    accessorKey: "index", // Matches SeriesDisplayRow
    header: "Index",
    cell: ({ row }) => row.original.index ?? "N/A",
  },
  {
    accessorKey: "data", // Matches SeriesDisplayRow
    header: "Data",
    cell: ({ row }) => row.original.data ?? "N/A",
  },
] 