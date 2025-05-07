"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, Check } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Table, Column } from "@tanstack/react-table"
import { ArrowDownUp } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface DataTableSortingOptionsProps<TData> {
  table: Table<TData>
}

//declare module '@tanstack/react-table' {
//  interface ColumnMeta<TData extends RowData, TValue> {
//    sortable: boolean
//  }
//}


// todo move to components
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
          size="icon"
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
              //value={column.getIsSorted()?.toString() ?? ""}
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





const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
