"use client"

import {
    Table as TTable,
    ColumnDef,
    flexRender,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    table: TTable<TData>,
    showHeaders?: boolean,
    header?: React.ReactNode
    footer?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    table,
    header,
    footer,
    showHeaders = true,
}: DataTableProps<TData, TValue>) {
    return (
        <Table>
            {showHeaders && (
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            )
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
            )}
            <TableBody>
                {table.getRowModel().rows?.length ? (<>
                    {header && (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                {header}
                            </TableCell>
                        </TableRow>
                    )}
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {footer && (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                {footer}
                            </TableCell>
                        </TableRow>
                    )}
                </>
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
