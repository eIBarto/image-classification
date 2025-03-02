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
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    table: TTable<TData>,
    showHeaders?: boolean,
    isLoading?: boolean,
    header?: React.ReactNode
    footer?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    table,
    header,
    footer,
    showHeaders = true,
    isLoading = false,
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
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`loading-cell-${colIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : 
                table.getRowModel().rows?.length ? (<>
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
