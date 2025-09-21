"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const matrixValues = [

  [10, 20, 5, 15],
  [8, 12, 25, 18],
  [15, 5, 22, 10],
  [20, 18, 7, 30],
];

const rowLabels = ["Predicted A", "Predicted B", "Predicted C", "Predicted D"];
const columnLabels = ["Actual 1", "Actual 2", "Actual 3", "Actual 4"];

const getCellBackgroundColor = (value: number, minVal: number, maxVal: number): string => {
  if (minVal === maxVal) return "bg-slate-100";

  const percentage = (value - minVal) / (maxVal - minVal);

  if (percentage < 0.2) return "bg-blue-100";
  if (percentage < 0.4) return "bg-blue-200";
  if (percentage < 0.6) return "bg-blue-300";
  if (percentage < 0.8) return "bg-blue-400";
  return "bg-blue-500";
};

export function ContingencyMatrix() {

  const allValues = matrixValues.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px] bg-slate-50 border-b sticky top-0 z-10">Predicted \\ Actual</TableHead>
          {columnLabels.map((label, index) => (
            <TableHead key={`col-header-${index}`} className="text-center bg-slate-50 border-b sticky top-0 z-10">{label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {matrixValues.map((row, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            <TableHead className="font-medium bg-slate-50 border-r sticky left-0 z-10">{rowLabels[rowIndex]}</TableHead>
            {row.map((cellValue, cellIndex) => (
              <TableCell
                key={`cell-${rowIndex}-${cellIndex}`}
                className={`text-center ${getCellBackgroundColor(cellValue, minVal, maxVal)}`}
              >
                {cellValue}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

