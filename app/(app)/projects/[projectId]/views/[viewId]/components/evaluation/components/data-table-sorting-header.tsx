"use client"

import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, Column } from "@tanstack/react-table"
import { ArrowDownUp } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface DataTableSortingHeaderProps<TData> {
  column: Column<TData>
}

export function DataTableSortingHeader<TData>({
  column,
}: DataTableSortingHeaderProps<TData>) {


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
    <Button
    variant="ghost"
    size="sm"
    className="h-auto px-2 py-1"
    onClick={() => handleSorting(column)}
  >   
    <span className="text-xs mr-1">{column.id}</span>
    {column.getIsSorted() && (
      <span className="ml-auto">
        {column.getIsSorted() === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
      </span>
    )}
  </Button>
  )
}