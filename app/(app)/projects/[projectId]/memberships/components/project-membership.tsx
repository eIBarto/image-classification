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
import { columns } from "./project-membership-table-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateProjectMembershipDialogDrawer } from "./create-project-membership-dialog-drawer";
import { CreateProjectMembershipFormSchema } from "./create-project-membership-form";
import { toast } from "sonner"

const client = generateClient<Schema>();

async function createProjectMembership(options: Schema["createProjectMembershipProxy"]["args"]) {
  const { data, errors } = await client.mutations.createProjectMembershipProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to create project membership")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}


async function listProjectMembers(options: Schema["listProjectMembershipsProxy"]["args"]): Promise<Schema["ListProjectMembershipsResponse"]["type"]> {
  console.log("options", options)
  const { data, errors } = await client.queries.listProjectMembershipsProxy(options)

  console.log("data", data)
  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch projects memberships")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function deleteProjectMembership(options: Schema["deleteProjectMembershipProxy"]["args"]): Promise<Schema["ProjectMembershipProxy"]["type"] | undefined | null> {
  const { data, errors } = await client.mutations.deleteProjectMembershipProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to delete project membership")
  }

  //if (!data) {
  //  throw new Error("No data returned")
  //}

  return data
}

async function updateProjectMembership(options: Schema["updateProjectMembershipProxy"]["args"]): Promise<Schema["ProjectMembershipProxy"]["type"] | undefined | null> {
  const { data, errors } = await client.mutations.updateProjectMembershipProxy(options)

  if (errors) {
    console.error(errors)
    console.log("options", options)
    throw new Error("Failed to update project membership")
  }

  //if (!data) {
  //  throw new Error("No data returned")
  //}

  return data
}

export interface ProjectMembershipTableProps {
  projectId: string
}

export function ProjectMembershipTable({ projectId }: ProjectMembershipTableProps) {
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
    queryKey: ["project-memberships", projectId],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<{
      items: Array<Schema["ProjectMembershipProxy"]["type"]>
      previousToken: string | null
      nextToken: string | null,
    }> => {
      const { items, nextToken = null } = await listProjectMembers({ projectId: projectId, nextToken: pageParam })

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
    getRowId: row => row.accountId,
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

  const deleteProjectMembershipMutation = useMutation({
    mutationFn: deleteProjectMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] })
    },
  })

  const updateProjectMembershipMutation = useMutation({
    mutationFn: updateProjectMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] })
    },
  })

  const createProjectMembershipMutation = useMutation({
    mutationFn: createProjectMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] }) //setOpen(false)
    },
  })

  function handleRowAction(action: string, record: Schema["ProjectMembershipProxy"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          deleteProjectMembershipMutation.mutate({
            projectId: projectId,
            accountId: record.accountId,
          })
          break
        case "update":
          if (!record) {
            throw new Error("Record is undefined")
          }
          updateProjectMembershipMutation.mutate({
            projectId: projectId,
            accountId: record.accountId,
            access: record.access,
          })
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update project membership")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }


  async function handleCreateProjectMembership(values: CreateProjectMembershipFormSchema) {
    try {
      for (const accountId of values.users) {
        await createProjectMembershipMutation.mutateAsync({
          projectId,
          accountId,
        })
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to create project membership")
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <CreateProjectMembershipDialogDrawer trigger={<Button className="ml-auto">
          Add Membership
        </Button>} onSubmit={handleCreateProjectMembership} />
      </div>
      <div className="rounded-md border">
        <DataTable columns={columns} table={table} header={<div className="flex items-center justify-between text-xs">
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
