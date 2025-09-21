"use client"
/**
 * Generic data table rendering rows/cells via TanStack Table
 * - Keep render pure and defer actions via table.meta.onRowAction
 */

import {
    Table as TableDef,
    ColumnDef,
    flexRender,
    RowData,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    table: TableDef<TData>,

}

declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        onRowAction?: (action: string, record: TData & Record<string, unknown>) => Promise<void> | void
    }
}

export function DataTable<TData, TValue>({
    columns,
    table,

}: DataTableProps<TData, TValue>) {
    return (
        <Table >

            <TableBody >
                {table.getRowModel().rows?.length ?
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                    : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
            </TableBody>

        </Table >
    )
}
