"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DataFrameStructured, DataFrameDisplayRow } from "../types"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
  getSortedRowModel,
  SortingState,
  Row,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { DataTableViewOptions } from "./data-table-view-options"

import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DataTableSortingHeader } from "./data-table-sorting-header"
import { DataTablePagination } from "./data-table-pagination"
interface DataFrameTableProps {
  title?: string
  dataFrame: DataFrameStructured | null | undefined
  defaultSort?: { id: string; desc: boolean }
  className?: string
}

// Helper to format DataFrame to TSV for clipboard
function formatDataFrameToTsv(dataFrame: DataFrameStructured, title?: string): string {
  let tsvString = "";
  // Add header row (index label + column names)
  const indexHeader = title && title.toLowerCase().includes("contingency") ? "Predicted \\ Actual" : "Index";
  const headerRow = [indexHeader, ...(dataFrame.columns || [])].join("\t");
  tsvString += headerRow + "\n";

  // Add data rows (index value + cell values)
  (dataFrame.data_rows || []).forEach((row, rowIndex) => {
    const indexValue = dataFrame.index?.[rowIndex] ?? `Row ${rowIndex + 1}`;
    const cellValues = (row.values || []).map(val => val === null ? "" : String(val)).join("\t");
    tsvString += `${indexValue}\t${cellValues}\n`;
  });
  return tsvString;
}

export function DataFrameTable({
  title,
  dataFrame,
  defaultSort,
  className,
}: DataFrameTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>(
    defaultSort ? [defaultSort] : []
  )
  const [hasCopied, setHasCopied] = useState(false)

  const columns: ColumnDef<DataFrameDisplayRow>[] = useMemo(() => {
    if (!dataFrame || !dataFrame.columns) return []

    const indexColLabel = title && title.toLowerCase().includes("contingency") ? "Predicted \\ Actual" : "Index"
    const isContingencyMatrix = title?.toLowerCase().includes("contingency matrix") ?? false;

    return [
      {
        accessorKey: "_index",
        header: indexColLabel,
        cell: ({ row }: { row: Row<DataFrameDisplayRow> }) => <div className="font-medium text-left px-3 py-2">{row.original["_index"]}</div>,
        size: 200,
        enableSorting: !isContingencyMatrix,
      },
      ...dataFrame.columns.map((colName, colIndex) => ({
        accessorKey: colName ?? `col-${colIndex}`,
        header: colName ?? "N/A",
        cell: ({ row }: { row: Row<DataFrameDisplayRow> }) => {
          const value = row.getValue<string | null>(colName ?? `col-${colIndex}`);
          return <div className="text-center px-3 py-2 tabular-nums">{value ?? "N/A"}</div>;
        },
        enableSorting: !isContingencyMatrix,
      })),
    ]
  }, [dataFrame, title])

  const data: DataFrameDisplayRow[] = useMemo(() => {
    if (!dataFrame || !dataFrame.data_rows) return []
    return dataFrame.data_rows.map((row, rowIndex) => {
      const displayRow: DataFrameDisplayRow = {
        _index: dataFrame.index?.[rowIndex] ?? `Row ${rowIndex + 1}`,
      }
      row.values.forEach((value, colIndex) => {
        const colName = dataFrame.columns?.[colIndex] ?? `col-${colIndex}`
        displayRow[colName] = value
      })
      return displayRow
    })
  }, [dataFrame])

  const table = useReactTable<DataFrameDisplayRow>({
    data,
    columns,
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const isEmpty = !dataFrame ||
    !dataFrame.columns ||
    dataFrame.columns.length === 0 ||
    !dataFrame.data_rows ||
    dataFrame.data_rows.length === 0 ||
    columns.length === 0 ||
    data.length === 0

  const handleCopyToClipboard = () => {
    if (!dataFrame) return
    const tsvData = formatDataFrameToTsv(dataFrame, title)
    navigator.clipboard.writeText(tsvData).then(() => {
      setHasCopied(true)
      toast.success(`${title || "Table"} data copied to clipboard!`)
      setTimeout(() => setHasCopied(false), 2000)
    }).catch(err => {
      console.error("Failed to copy table: ", err)
      toast.error("Failed to copy table.")
    })
  }

  if (isEmpty && title && title.toLowerCase().includes("contingency")) {
    // For contingency matrices that might be legitimately empty (e.g. one run compared to itself)
    // we still might want to show *something* or let it be handled by the parent
    // For now, let's render a minimal message consistent with general empty state.
  }

  return (
    <div className={cn("my-2", className)}>
      <div className="flex justify-between items-center mb-2">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {!isEmpty && dataFrame && (
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          {!isEmpty ? (
            <>
              <TableHeader /*className="sticky top-0 bg-background z-10"*/ className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn("whitespace-nowrap px-2 py-1 text-xs bg-muted", header.column.id === "_index" ? "text-left" : "text-center")}
                        style={{ width: header.getSize() }}
                      >
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
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="p-0 text-xs"
                        style={{ width: cell.column.getSize() }}
                      >
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
                  colSpan={Math.max(1, columns?.length || 1)}
                  className="h-20 p-0 text-xs text-center text-muted-foreground"
                >
                  <div className="px-3 py-2">Data is present but could not be displayed in table format (e.g., no columns defined), or no data available.</div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
} 