"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SeriesStructured, SeriesDisplayRow } from "../types"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { DataTableViewOptions } from "./data-table-view-options"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"
import { DataTableSortingHeader } from "./data-table-sorting-header"

interface SeriesStructuredTableProps {
  title: string
  seriesData: SeriesStructured | null | undefined
}

const transformSeriesDataForDisplay = (
  seriesData: SeriesStructured | null | undefined
): SeriesDisplayRow[] => {
  if (!seriesData || !seriesData.index || !seriesData.data) return []
  return seriesData.index.map((idx, i) => ({
    index: idx,
    data: seriesData.data?.[i] ?? null,
  }))
}

function formatSeriesToTsv(seriesData: SeriesStructured): string {
  let tsvString = "Index\tValue\n"
  if (seriesData.name) {
    tsvString = `Index\t${seriesData.name}\n`
  }
  
  (seriesData.index || []).forEach((indexVal, i) => {
    const dataVal = seriesData.data?.[i] ?? "N/A"
    tsvString += `${indexVal ?? "N/A"}\t${dataVal}\n`
  })
  return tsvString
}

export function SeriesStructuredTable({ title, seriesData }: SeriesStructuredTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [hasCopied, setHasCopied] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns = useMemo<ColumnDef<SeriesDisplayRow>[]>(() => [
    {
      accessorKey: "index",
      header: "Index",
      cell: ({ row }) => (
        <div className="font-medium text-left px-3 py-2">{row.getValue("index")}</div>
      ),
      size: 200,
      enableSorting: false,
    },
    {
      accessorKey: "data",
      header: seriesData?.name || "Value",
      cell: ({ row }) => <div className="text-left px-3 py-2 tabular-nums">{row.getValue("data")}</div>,
      enableSorting: true,
    },
  ], [seriesData?.name])

  const data = useMemo(() => transformSeriesDataForDisplay(seriesData), [seriesData])

  const table = useReactTable<SeriesDisplayRow>({
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

  const isEmpty = !seriesData || 
                  !seriesData.index || 
                  seriesData.index.length === 0 || 
                  !seriesData.data || 
                  seriesData.data.length === 0 ||
                  data.length === 0

  const handleCopyToClipboard = () => {
    if (!seriesData || isEmpty) return
    const tsvData = formatSeriesToTsv(seriesData)
    navigator.clipboard.writeText(tsvData).then(() => {
      setHasCopied(true)
      toast.success(`${title || "Table"} data copied to clipboard!`)
      setTimeout(() => setHasCopied(false), 2000)
    }).catch(err => {
      console.error("Failed to copy table: ", err)
      toast.error("Failed to copy table.")
    })
  }

  if (!seriesData && data.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>No data available.</p>
      </div>
    )
  }

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          {title} {seriesData?.name && `(${seriesData.name})`}
        </h3>
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          {!isEmpty ? (
            <>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-2 py-1 text-xs text-left bg-muted" style={{ width: header.getSize() }}>
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
                  <div className="px-3 py-2">No series data available.</div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  )
} 