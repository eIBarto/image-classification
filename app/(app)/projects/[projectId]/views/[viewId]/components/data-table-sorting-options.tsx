"use client"
/** Compact sorting control for TanStack Table (view scope) */

import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, Column } from "@tanstack/react-table"
import { ArrowDownUp } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface DataTableSortingOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableSortingOptions<TData>({
  table,
}: DataTableSortingOptionsProps<TData>) {

  function handleSorting(column: Column<TData>) {
    switch (column.getIsSorted()) {
      case "asc":
        column.clearSorting()
        break
      case "desc":
        column.toggleSorting(false)
        break
      case false:
        column.toggleSorting(true)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="ml-auto hidden lg:flex"
        >
          <ArrowDownUp />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {table.getAllColumns().filter(column => column.getCanSort()).map((column) => (
            <DropdownMenuItem
              disabled={!column.getCanSort()}
              key={column.id}

              onClick={() => {
                handleSorting(column)
              }}
            >
              <span className="text-xs">{column.id}</span>
              {column.getIsSorted() && (
                <span className="ml-auto">
                  {column.getIsSorted() === "desc" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
