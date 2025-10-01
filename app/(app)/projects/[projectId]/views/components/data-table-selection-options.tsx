"use client"

import * as React from "react"
import { Check, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataTableSelectionProps<TData> {
  table: Table<TData>
}

export function DataTableSelectionOptions<TData>({
  table,
}: DataTableSelectionProps<TData>) {

  const isAllSelected = table.getIsAllRowsSelected()
  const isSomeSelected = table.getIsSomeRowsSelected()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={table.getToggleAllRowsSelectedHandler()}
            aria-label={isAllSelected ? "Deselect all rows" : "Select all rows"}
          >
            {isAllSelected ? (
              <CheckCheck className="h-4 w-4" />
            ) : isSomeSelected ? (
              <Check className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isAllSelected
            ? "Deselect all rows"
            : isSomeSelected
              ? "Select all rows"
              : "Select all rows"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
