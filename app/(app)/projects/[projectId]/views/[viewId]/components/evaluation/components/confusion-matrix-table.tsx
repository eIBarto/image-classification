'use client'

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  type TableOptions,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"
import type { DataFrameStructured, DataFrameDisplayRow } from "../types"
import { cn } from "@/lib/utils"
import { 
    confusionMatrixIndexColumn, 
    createConfusionMatrixDataColumn, 
    gradientStartColor, 
    gradientEndColor 
} from "./confusion-matrix-columns"
import { GradientLegend } from "./gradient-legend"
import { DataTableSortingHeader } from "./data-table-sorting-header";

interface ConfusionMatrixTableProps {
  title?: string
  dataFrame: DataFrameStructured | null | undefined
}

interface ConfusionMatrixTableMeta {
  minValue: number;
  maxValue: number;
}

function formatDataFrameAsTsv(dataFrame: DataFrameStructured): string {
    let tsvString = "";
    const headerRow = ["Predicted \\ Actual", ...(dataFrame.columns || [])].join("\t");
    tsvString += headerRow + "\n";

    (dataFrame.data_rows || []).forEach((row, rowIndex) => {
        const indexValue = dataFrame.index?.[rowIndex] ?? `Row ${rowIndex + 1}`;
        const cellValues = (row.values || []).map(val => val === null ? "" : String(val)).join("\t");
        tsvString += `${indexValue}\t${cellValues}\n`;
    });
    return tsvString;
}

export function ConfusionMatrixTable({ title, dataFrame }: ConfusionMatrixTableProps) {
  const [hasCopied, setHasCopied] = useState(false);

  // Destructure dataFrame properties at component level
  const dataRows = dataFrame?.data_rows;
  const columns = dataFrame?.columns;
  const index = dataFrame?.index;

  const {minValue, maxValue } = useMemo(() => {
    if (!dataRows) {
      return { minValue: 0, maxValue: 0 };
    }
    const numericValues = dataRows
      .flatMap(row => row.values.map(val => val === null ? null : parseFloat(val)))
      .filter(val => val !== null && !isNaN(val)) as number[];
    
    const min = numericValues.length > 0 ? Math.min(...numericValues) : 0;
    const max = numericValues.length > 0 ? Math.max(...numericValues) : 0;
    return { minValue: min, maxValue: max };
  }, [dataRows]);

  const tableColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    return [
      confusionMatrixIndexColumn,
      ...columns.map((colName, colIndex) => 
        createConfusionMatrixDataColumn(colName, colIndex)
      )
    ];
  }, [columns]);

  const tableData = useMemo(() => {
    if (!dataRows) return [];
    return dataRows.map((row, rowIndex) => {
      const displayRow: DataFrameDisplayRow = { 
        _index: index?.[rowIndex] ?? `Row ${rowIndex + 1}` 
      };
      row.values.forEach((value, colIndex) => {
        const colName = columns?.[colIndex] ?? `col-${colIndex}`;
        displayRow[colName] = value;
      });
      return displayRow;
    });
  }, [dataRows, index, columns]);

  const table = useReactTable<DataFrameDisplayRow>({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      minValue,
      maxValue,
    } as ConfusionMatrixTableMeta & TableOptions<DataFrameDisplayRow>["meta"],
  });

  const isEmpty = !dataFrame || 
                  !columns || 
                  columns.length === 0 || 
                  !dataRows || 
                  dataRows.length === 0 || 
                  tableColumns.length === 0 || 
                  tableData.length === 0;

  const handleCopyToClipboard = () => {
    if (!dataFrame) return;
    const tsvData = formatDataFrameAsTsv(dataFrame);
    navigator.clipboard.writeText(tsvData).then(() => {
      setHasCopied(true);
      toast.success("Matrix copied to clipboard!")
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy matrix: ", err);
      toast.error("Failed to copy matrix.")
    });
  };

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-2 relative">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {!isEmpty && dataFrame && (
            <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopyToClipboard} 
                aria-label="Copy matrix to clipboard"
            >
                {hasCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
            </Button>
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
                      <TableHead 
                        key={header.id} 
                        className={cn(
                            "text-center whitespace-nowrap px-2 py-1 text-xs bg-muted",
                        )}
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
                          className={cn("p-0")}
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
                  className="h-20 px-2 py-1 text-xs text-center text-muted-foreground"
                >
                  No confusion matrix data to display.
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>
      {!isEmpty && (
        <GradientLegend 
            minValue={minValue} 
            maxValue={maxValue} 
            startColor={gradientStartColor} 
            endColor={gradientEndColor} 
            className="justify-center"
        />
      )}
    </div>
  );
} 