"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//import { DataTableViewOptions } from "./data-table-view-options"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <div className="flex items-center space-x-2 mr-auto">
        <Input
          placeholder="Filter memberships..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-auto">
        {/*<DataTableViewOptions table={table} />*/}
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex"
          disabled={!table.getSelectedRowModel().rows.length}
        >
          {table.getSelectedRowModel().rows.length} selected
        </Button>
      </div>
    </div>
  )
}
