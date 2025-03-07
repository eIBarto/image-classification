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
import { columns } from "./prompt-table-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatePromptDialogDrawer } from "./create-prompt-dialog-drawer";
import { CreatePromptFormSchema } from "./create-prompt-form";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const client = generateClient<Schema>();

async function createPrompt(options: Schema["createPromptProxy"]["args"]) {
  const { data, errors } = await client.mutations.createPromptProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to create project prompt")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function listPrompts(options: Schema["listPromptsProxy"]["args"]): Promise<Schema["ListPromptsResponse"]["type"]> {
  console.log("options", options)
  const { data, errors } = await client.queries.listPromptsProxy(options)

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

async function deletePrompt(options: Schema["deletePromptProxy"]["args"]): Promise<Schema["PromptProxy"]["type"]> {
  const { data, errors } = await client.mutations.deletePromptProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to delete project prompt")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function updatePrompt(options: Schema["updatePromptProxy"]["args"]): Promise<Schema["PromptProxy"]["type"]> {
  const { data, errors } = await client.mutations.updatePromptProxy(options)

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

export interface PromptTableProps {
  projectId: string
}

export function PromptTable({ projectId }: PromptTableProps) {
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
    queryKey: ["project-prompts", projectId],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<{
      items: Array<Schema["PromptProxy"]["type"]>
      previousToken: string | null
      nextToken: string | null,
    }> => {
      const { items, nextToken = null } = await listPrompts({ projectId: projectId, nextToken: pageParam })

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

  const deletePromptMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompts', projectId] })
    },
  })

  const updatePromptMutation = useMutation({
    mutationFn: updatePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompts', projectId] })
    },
  })

  const createPromptMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompts', projectId] }) //setOpen(false)
    },
  })

  function handleRowAction(action: string, record: Schema["PromptProxy"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          deletePromptMutation.mutate({
            projectId: projectId,
            promptId: record.id,
          })
          break
        case "update":
          if (!record) {
            throw new Error("Record is undefined")
          }
          updatePromptMutation.mutate({
            projectId: projectId,
            promptId: record.id,
            summary: record.summary,
            description: record.description,
          })
          break
        case "view":
          if (!record) {
            throw new Error("Record is undefined")
          }
          router.push(`/projects/${projectId}/prompts/${record.id}`)
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


  async function handleCreatePrompt(values: CreatePromptFormSchema) {
    try {
      const { summary, description } = values
      await createPromptMutation.mutateAsync({
        projectId,
        summary,
        description,
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
        <CreatePromptDialogDrawer trigger={<Button className="ml-auto">
          Add Prompt
        </Button>} onSubmit={handleCreatePrompt} />
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
