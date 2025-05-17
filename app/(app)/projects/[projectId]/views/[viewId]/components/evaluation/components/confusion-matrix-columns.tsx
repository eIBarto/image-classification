'use client'

import type { ColumnDef } from "@tanstack/react-table"
import type { DataFrameDisplayRow } from "../types"

// Helper function to determine text color based on background brightness
function getTextColorForBackground(bgColor: string): string {
  if (!bgColor || bgColor === "#FFFFFF" || bgColor === "#F8F9FA") return "#000000"; // Default to black for light/default backgrounds
  const color = bgColor.substring(1); // strip #
  const rgb = parseInt(color, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128 ? "#FFFFFF" : "#000000"; // White for dark, Black for light
}

// Helper function to generate a color scale
function getValueColor(value: number, min: number, max: number): string {
  if (min === max || value === null || isNaN(value)) {
    return "#FFFFFF"; // White for no variation, null, or NaN values (will use black text)
  }
  const percentage = (value - min) / (max - min);
  const startColor = { r: 224, g: 239, b: 255 }; // Lightest blue: #E0EFFF
  const endColor = { r: 0, g: 61, b: 122 };   // Darkest blue: #003D7A

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percentage);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Export the colors used for the gradient
export const gradientStartColor = { r: 224, g: 239, b: 255 }; // #E0EFFF
export const gradientEndColor = { r: 0, g: 61, b: 122 };   // #003D7A

// Exported definition for the index column
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

// Exported function to create a data column definition
export function createConfusionMatrixDataColumn(
  colName: string | null,
  colIndex: number
): ColumnDef<DataFrameDisplayRow> {
  return {
    accessorKey: colName ?? `col-${colIndex}`,
    header: () => colName ?? "N/A",
    enableSorting: false,
    cell: (props) => {
      // Access minValue and maxValue from table.options.meta
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