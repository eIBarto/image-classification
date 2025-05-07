"use client"

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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    table: TableDef<TData>,
    showHeader?: boolean,
    showFooter?: boolean,
    tableProps?: React.ComponentProps<typeof Table>,
    tableHeaderProps?: Omit<React.ComponentPropsWithoutRef<typeof TableHeader>, "children">,
    tableBodyProps?: Omit<React.ComponentProps<typeof TableBody>, "children">,
    tableFooterProps?: Omit<React.ComponentProps<typeof TableFooter>, "children">,
}

declare module '@tanstack/table-core' { // todo isolate definition
    interface TableMeta<TData extends RowData> {
        onRowAction?: (action: string, record: any) => Promise<void> | void
    }
}

export function DataTable<TData, TValue>({
    columns,
    table,
    showHeader = true,
    showFooter = false,
    tableProps,
    tableHeaderProps,
    tableBodyProps,
    tableFooterProps,
}: DataTableProps<TData, TValue>) {
    return (
        <Table {...tableProps}>
            {showHeader && (
                <TableHeader {...tableHeaderProps}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} >
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
            <TableBody {...tableBodyProps}>
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
            {showFooter && (
                <TableFooter {...tableFooterProps}>
                    {table.getFooterGroups().map((footerGroup) => (
                        <TableRow key={footerGroup.id}>
                            {footerGroup.headers.map((header) => (
                                <TableCell key={header.id}>
                                    {header.column.columnDef.footer ?
                                        flexRender(header.column.columnDef.footer, header.getContext())
                                        : null}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableFooter>)
            }
        </Table >
    )
}
