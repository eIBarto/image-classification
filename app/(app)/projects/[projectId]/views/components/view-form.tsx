"use client"

import { cn } from "@/lib/utils"

import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState, useReactTable, RowSelectionState } from "@tanstack/react-table"
import { columns } from "./file-columns"
import { useMemo, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Schema } from '@/amplify/data/resource';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { generateClient } from 'aws-amplify/data';
import { DataTable } from "./data-table"
import { DataTableSelectionOptions } from "./data-table-selection-options"
import { useInView } from "react-intersection-observer"
import { DataTableSortingOptions } from "./data-table-sorting-options"

const client = generateClient<Schema>();

async function listProjectFiles(options: Schema["listProjectFilesProxy"]["args"]): Promise<Schema["ListProjectFilesResponse"]["type"]> {
  const { data, errors } = await client.queries.listProjectFilesProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch files")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }

  return data
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  files: z.array(z.string()).min(1, "At least one file is required"),
});



export type ViewFormSchema = z.infer<typeof formSchema>;

export interface ViewFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: ViewFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
  defaultValues?: Partial<ViewFormSchema>
  projectId: string
}

export function ViewForm({
  className,
  onSubmit,
  resetOnSuccess = true,
  defaultValues = {},
  projectId,
  ...props
}: ViewFormProps) {
  const {ref, inView} = useInView()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})



  const form = useForm<ViewFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["project-files", projectId],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<{
      items: Array<Schema["ProjectFileProxy"]["type"]>
      previousToken: string | null
      nextToken: string | null,
    }> => {
      const { items, nextToken = null } = await listProjectFiles({ projectId: projectId, nextToken: pageParam, imageOptions: { width: 64, height: 64, format: "webp" } })

      return { items, previousToken: pageParam, nextToken }
    },
    initialPageParam: null,
    getPreviousPageParam: (firstPage) => firstPage.previousToken,
    getNextPageParam: (lastPage) => lastPage.nextToken,
  })

  useEffect(() => {
    if (error) {
      console.error(error)
      toast.error("Failed to fetch prompt versions")
    }
  }, [error])

  const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

  const table = useReactTable({
    data: items,
    columns: columns,
    getRowId: row => row.fileId,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    initialState: { // todo might move to state 
      columnVisibility: {
        createdAt: false,
        updatedAt: false,
      },
    },
    state: {
      columnFilters,
      sorting,
      rowSelection,
    },
    //meta: {
    //    onRowAction: handleRowAction
    //}
  })

  useEffect(() => {
    form.setValue("files", Object.entries(rowSelection).filter(([, value]) => value).map(([key]) => key))
  }, [rowSelection, form])

  const handleSubmit = form.handleSubmit(async (values: ViewFormSchema) => {
    try {
      const result = await onSubmit?.(values)
      if (result) {
        throw new Error(result)
      }
      if (resetOnSuccess) {
        form.reset()
      }
    } catch (error) {
      console.error(error)
      form.setError("root", { message: error instanceof Error ? error.message : "An error occurred" })
    }
  })


  useEffect(() => {
    if (inView) {
        fetchNextPage()
    }
}, [fetchNextPage, inView])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2 p-0.5 flex-1", className)}>
        <FormField
          control={form.control}
          name="name"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Text" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                View Name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="View Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                View Description
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          //disabled={disabled}// || isSubmitting}
          render={(/*({ field: { disabled, ...field } }*/) => (
            <FormItem>
              <FormLabel>Files</FormLabel>
              <FormControl className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-between">
                    <Input placeholder="Filter views..."
                      value={(table.getColumn("data")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("data")?.setFilterValue(event.target.value)
                      }
                    />
                    <DataTableSortingOptions table={table} />
                    <DataTableSelectionOptions table={table} />
                  </div>
                  <ScrollArea className="flex-1 max-h-[250px] overflow-y-auto overflow-x-hidden">
                    {isLoading ? (
                      <Table>
                        <TableBody>
                          {Array.from({ length: 10 }).map((_, index) => (
                            <TableRow key={`loading-${index}`}>
                              <TableCell>
                                <Skeleton className="h-4 w-3/4" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : table.getRowCount() > 0 ? (
                      <DataTable table={table} columns={columns} />
                    ) : <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No views found</p>
                    </div>}
                    {hasNextPage && (
                      <div className="flex items-center justify-center">
                        <Button ref={ref} variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </FormControl>
              <FormDescription>
                {Object.keys(rowSelection).length} files selected
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Continue"}
        </Button>
      </form>
    </Form>
  )
}