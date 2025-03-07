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
import { columns } from "./prompt-version-table-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatePromptVersionDialogDrawer } from "./create-prompt-version-dialog-drawer";
import { CreatePromptVersionFormSchema } from "./create-prompt-version-form";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const client = generateClient<Schema>();

async function createPromptVersion(options: Schema["createPromptVersionProxy"]["args"]) {
  const { data, errors } = await client.mutations.createPromptVersionProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to create project prompt")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function listPromptVersions(options: Schema["listPromptVersionsProxy"]["args"]): Promise<Schema["ListPromptVersionsResponse"]["type"]> {
  console.log("options", options)
  const { data, errors } = await client.queries.listPromptVersionsProxy(options)

  console.log("data", data)
  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch projects prompts")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function deletePromptVersion(options: Schema["deletePromptVersionProxy"]["args"]): Promise<Schema["PromptVersionProxy"]["type"]> {
  const { data, errors } = await client.mutations.deletePromptVersionProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to delete project prompt")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function updatePromptVersion(options: Schema["updatePromptVersionProxy"]["args"]): Promise<Schema["PromptVersionProxy"]["type"]> {
  const { data, errors } = await client.mutations.updatePromptVersionProxy(options)

  if (errors) {
    console.error(errors)
    console.log("options", options)
    throw new Error("Failed to update project prompt")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

export interface PromptVersionTableProps {
  projectId: string
  promptId: string
}

export function PromptVersionTable({ projectId, promptId }: PromptVersionTableProps) {
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
    queryKey: ["project-prompt-versions", projectId, promptId],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<{
      items: Array<Schema["PromptVersionProxy"]["type"]>
      previousToken: string | null
      nextToken: string | null,
    }> => {
      const { items, nextToken = null } = await listPromptVersions({ projectId: projectId, promptId: promptId, nextToken: pageParam })

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
    getRowId: row => `${row.promptId}-${row.version}`,
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

  const deletePromptVersionMutation = useMutation({
    mutationFn: deletePromptVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompt-versions', projectId, promptId] })
    },
  })

  const updatePromptVersionMutation = useMutation({
    mutationFn: updatePromptVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompt-versions', projectId, promptId] })
    },
  })

  const createPromptVersionMutation = useMutation({
    mutationFn: createPromptVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompt-versions', projectId, promptId] }) //setOpen(false)
    },
  })

  function handleRowAction(action: string, record: Schema["PromptVersionProxy"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          deletePromptVersionMutation.mutate({
            projectId: projectId,
            promptId: record.promptId,
            version: record.version,
          })
          break
        case "update":
          if (!record) {
            throw new Error("Record is undefined")
          }
          updatePromptVersionMutation.mutate({
            projectId: projectId,
            promptId: record.promptId,
            version: record.version,
            text: record.text,
          })
          break
        case "view":
          if (!record) {
            throw new Error("Record is undefined")
          }
          router.push(`/projects/${projectId}/prompts/${record.promptId}`)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update project prompt")
    }
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }


  async function handleCreatePromptVersion(values: CreatePromptVersionFormSchema) {
    try {
      const { version, text } = values
      await createPromptVersionMutation.mutateAsync({
        projectId,
        promptId,
        version,
        text,
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to create project prompt")
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Filter prompts..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <CreatePromptVersionDialogDrawer trigger={<Button className="ml-auto">
          Add Prompt version
        </Button>} onSubmit={handleCreatePromptVersion}/>
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
