'use client'
/** Column helpers for rendering confusion matrix cells with gradient coloring */

import type { ColumnDef } from "@tanstack/react-table"
import type { DataFrameDisplayRow } from "../types"

function getTextColorForBackground(bgColor: string): string {
  if (!bgColor || bgColor === "#FFFFFF" || bgColor === "#F8F9FA") return "#000000";
  const color = bgColor.substring(1);
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? "#FFFFFF" : "#000000";
}

function getValueColor(value: number, min: number, max: number): string {
  if (min === max || value === null || isNaN(value)) {
    return "#FFFFFF";
  }
  const percentage = (value - min) / (max - min);
  const startColor = { r: 224, g: 239, b: 255 };
  const endColor = { r: 0, g: 61, b: 122 };

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percentage);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const gradientStartColor = { r: 224, g: 239, b: 255 };
export const gradientEndColor = { r: 0, g: 61, b: 122 };

export const confusionMatrixIndexColumn: ColumnDef<DataFrameDisplayRow> = {
  accessorKey: "_index",
  header: "Predicted \\ Actual",
  size: 200,
  enableSorting: false,
  cell: ({ row }) => (
    <div className="font-medium text-left text-xs px-3 py-2 h-full w-full flex items-center whitespace-nowrap">
      {row.original["_index"] ?? "N/A"}
    </div>
  ),
};

export function createConfusionMatrixDataColumn(
  colName: string | null,
  colIndex: number
): ColumnDef<DataFrameDisplayRow> {
  return {
    accessorKey: colName ?? `col-${colIndex}`,
    header: () => colName ?? "N/A",
    enableSorting: false,
    cell: (props) => {

      const meta = props.table.options.meta as { minValue?: number; maxValue?: number } | undefined;
      const minValue = meta?.minValue ?? 0;
      const maxValue = meta?.maxValue ?? 0;

      const rawValue = props.getValue() as string | null;
      const numericVal = rawValue === null ? null : parseFloat(rawValue);

      const bgColor = (numericVal !== null && !isNaN(numericVal))
          ? getValueColor(numericVal, minValue, maxValue)
          : "#FFFFFF";
      const textColor = getTextColorForBackground(bgColor);

      return (
        <div
          style={{ backgroundColor: bgColor, color: textColor }}
          className="h-full w-full flex items-center justify-center text-center px-3 py-2 tabular-nums"
        >
          {rawValue ?? "N/A"}
        </div>
      );
    },
  };
}