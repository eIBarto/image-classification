"use client"

import {
  useState,
  useEffect,
  useMemo,
} from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { columns } from "./view-table-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateViewDialogDrawer } from "./create-view-dialog-drawer";
import { CreateViewFormSchema } from "./create-view-form";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const client = generateClient<Schema>();

async function createView(options: Schema["createViewProxy"]["args"]) {
  const { data, errors } = await client.mutations.createViewProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to create project view")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function listViews(options: Schema["listViewsProxy"]["args"]): Promise<Schema["ListViewsResponse"]["type"]> {
  console.log("options", options)
  const { data, errors } = await client.queries.listViewsProxy(options)

  console.log("data", data)
  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch projects views")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function deleteView(options: Schema["deleteViewProxy"]["args"]): Promise<Schema["ViewProxy"]["type"]> {
  const { data, errors } = await client.mutations.deleteViewProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to delete project view")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function updateView(options: Schema["updateViewProxy"]["args"]): Promise<Schema["ViewProxy"]["type"]> {
  const { data, errors } = await client.mutations.updateViewProxy(options)

  if (errors) {
    console.error(errors)
    console.log("options", options)
    throw new Error("Failed to update project view")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

export interface ViewTableProps {
  projectId: string
}

export function ViewTable({ projectId }: ViewTableProps) {
  const router = useRouter()
  const { ref, inView } = useInView()
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    dataUpdatedAt,
    error,
  } = useInfiniteQuery({
    queryKey: ["project-views", projectId],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<{
      items: Array<Schema["ViewProxy"]["type"]>
      previousToken: string | null
      nextToken: string | null,
    }> => {
      const { items, nextToken = null } = await listViews({ projectId: projectId, nextToken: pageParam })

      return { items, previousToken: pageParam, nextToken }
    },
    initialPageParam: null,
    getPreviousPageParam: (firstPage) => firstPage.previousToken,
    getNextPageParam: (lastPage) => lastPage.nextToken,
  })

  const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

  const table = useReactTable({
    data: items,
    columns,
    getRowId: row => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onRowAction: handleRowAction
    },
  })

  useEffect(() => {
    if (!inView) {
      return
    }
    fetchNextPage()
  }, [fetchNextPage, inView])

  const deleteViewMutation = useMutation({
    mutationFn: deleteView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-views', projectId] })
    },
  })

  const updateViewMutation = useMutation({
    mutationFn: updateView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-views', projectId] })
    },
  })

  const createViewMutation = useMutation({
    mutationFn: createView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-views', projectId] }) //setOpen(false)
    },
  })

  function handleRowAction(action: string, record: Schema["ViewProxy"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          deleteViewMutation.mutate({
            projectId: projectId,
            viewId: record.id,
          })
          break
        case "update":
          if (!record) {
            throw new Error("Record is undefined")
          }
          updateViewMutation.mutate({
            projectId: projectId,
            viewId: record.id,
            name: record.name,
            description: record.description,
          })
          break
        case "view":
          if (!record) {
            throw new Error("Record is undefined")
          }
          router.push(`/projects/${projectId}/views/${record.id}`)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update project view")
    }
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }


  async function handleCreateView(values: CreateViewFormSchema) {
    try {
      const { name, description, files } = values
      console.log("files", files)
      //for (const fileId of files) {
      await createViewMutation.mutateAsync({
        projectId,
        name,
        description,
        files
      })
      //}
    } catch (error) {
      console.error(error)
      toast.error("Failed to create project view")
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Filter views..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <CreateViewDialogDrawer trigger={<Button className="ml-auto">
          Add View
        </Button>} onSubmit={handleCreateView} projectId={projectId} />
      </div>
      <div className="rounded-md border">
        <DataTable isLoading={isLoading} columns={columns} table={table} header={<div className="flex items-center justify-between text-xs">
          <button
            onClick={() => fetchPreviousPage()}
            disabled={!hasPreviousPage || isFetchingPreviousPage}
            className={cn(
              "text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground",
              (!hasPreviousPage || isFetchingPreviousPage) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isFetchingPreviousPage
              ? 'Loading more...'
              : hasPreviousPage
                ? 'Load Older'
                : 'Up to date'}
          </button>
        </div>} footer={<div className="flex items-center justify-between text-xs">
          <button
            ref={ref}
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className={cn(
              "text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground",
              (!hasNextPage || isFetchingNextPage) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
                ? 'Load more'
                : 'No more items'}
          </button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <RefreshCcw className="h-3 w-3" />
            {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
          </div>
        </div>} />
      </div>
    </>
  )
}
