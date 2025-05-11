'use client'

import { useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  SortingState,
  VisibilityState,
  getSortedRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import type { PerClassPerformanceEntry, PerClassMetricValues } from "../types"
import { cn } from "@/lib/utils";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableSortingHeader } from "./data-table-sorting-header";

interface PerClassMetricsTableProps {
  title?: string
  data: PerClassPerformanceEntry[]
}

function formatPerClassMetricsToTsv(data: PerClassPerformanceEntry[]): string {
    let tsvString = "Label Name\tPrecision\tRecall\tF1-Score\tSupport\n";
    data.forEach(entry => {
        const label = entry.label_name ?? "N/A";
        const metrics = entry.metrics;
        const precision = metrics?.precision?.toFixed(3) ?? "N/A";
        const recall = metrics?.recall?.toFixed(3) ?? "N/A";
        const f1 = metrics?.f_1_score?.toFixed(3) ?? "N/A";
        const support = metrics?.support ?? "N/A";
        tsvString += `${label}\t${precision}\t${recall}\t${f1}\t${support}\n`;
    });
    return tsvString;
}

export function PerClassMetricsTable({ title, data }: PerClassMetricsTableProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<PerClassPerformanceEntry>[] = useMemo(() => [
    {
      accessorKey: "label_name",
      header: "Label Name",
      cell: ({ row }) => <div className="text-left px-3 py-2">{row.getValue("label_name") ?? "N/A"}</div>,
      enableSorting: true,
      size: 200,
    },
    {
      accessorKey: "metrics.precision",
      header: "Precision",
      cell: ({ row }) => {
        const metrics = row.original.metrics as PerClassMetricValues | null
        return <div className="text-center px-3 py-2 tabular-nums">{metrics?.precision?.toFixed(3) ?? "N/A"}</div>
      },
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "metrics.recall",
      header: "Recall",
      cell: ({ row }) => {
        const metrics = row.original.metrics as PerClassMetricValues | null
        return <div className="text-center px-3 py-2 tabular-nums">{metrics?.recall?.toFixed(3) ?? "N/A"}</div>
      },
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "metrics.f_1_score",
      header: "F1-Score",
      cell: ({ row }) => {
        const metrics = row.original.metrics as PerClassMetricValues | null
        return <div className="text-center px-3 py-2 tabular-nums">{metrics?.f_1_score?.toFixed(3) ?? "N/A"}</div>
      },
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "metrics.support",
      header: "Support",
      cell: ({ row }) => {
        const metrics = row.original.metrics as PerClassMetricValues | null
        return <div className="text-center px-3 py-2 tabular-nums">{metrics?.support ?? "N/A"}</div>
      },
      enableSorting: true,
      size: 80,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
        sorting,
        columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const isEmpty = !data || data.length === 0;

  const handleCopyToClipboard = () => {
    if (isEmpty) return;
    const tsvData = formatPerClassMetricsToTsv(data);
    navigator.clipboard.writeText(tsvData).then(() => {
      setHasCopied(true);
      toast.success(`${title || "Table"} data copied to clipboard!`)
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy table: ", err);
      toast.error("Failed to copy table.")
    });
  };

  return (
    <div className="my-4">
        <div className="flex justify-between items-center mb-2">
            {title && <h4 className="text-lg font-semibold">{title}</h4>}
            {!isEmpty && (
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleCopyToClipboard} 
                        aria-label={`Copy ${title || "table"} to clipboard`}
                    >
                        {hasCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            )}
        </div>
      <div className="rounded-md border">
        <Table>
          {!isEmpty ? (
            <>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id} className="px-2 py-1 text-xs text-center bg-muted" style={{ width: header.getSize() }}>
                            {header.isPlaceholder
                                ? null
                                : header.column.getCanSort() ? (
                                  <DataTableSortingHeader column={header.column} />
                                ) : (
                                  flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                  )
                                )}
                            </TableHead>
                        )
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-0 text-xs" style={{ width: cell.column.getSize() }}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                </TableBody>
            </>
            ) : (
                <TableBody>
                    <TableRow>
                        <TableCell
                        colSpan={columns.length}
                        className="h-20 p-0 text-xs text-center text-muted-foreground"
                        >
                        <div className="px-3 py-2">No per-class metrics data available.</div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            )}
        </Table>
      </div>
    </div>
  )
} 