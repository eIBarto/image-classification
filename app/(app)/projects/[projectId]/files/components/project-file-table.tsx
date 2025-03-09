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
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { columns } from "./project-file-table-columns"
import { Input } from "@/components/ui/input"
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
//import { CreateFileDialog } from "./create-project-membership-dialog-drawer";
//import { CreateFileFormSchema } from "./create-project-membership-form";
import { toast } from "sonner"

const client = generateClient<Schema>();

async function listProjectFiles(options: Schema["listProjectFilesProxy"]["args"]): Promise<Schema["ListProjectFilesResponse"]["type"]> {
  const { data, errors } = await client.queries.listProjectFilesProxy(options)

  console.log("data", data)
  if (errors) {
    throw new Error("Failed to fetch files")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}

async function getProjectFile(options: Schema["getProjectFileProxy"]["args"]): Promise<Schema["ProjectFileProxy"]["type"]> {
  const { data, errors } = await client.queries.getProjectFileProxy(options)

  if (errors) {
    throw new Error("Failed to get file")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  console.log("getFile::data", data)

  return data
}

async function deleteProjectFile(options: Schema["deleteProjectFileProxy"]["args"]): Promise<Schema["ProjectFileProxy"]["type"]> {
  const { data, errors } = await client.mutations.deleteProjectFileProxy(options)

  if (errors) {
    throw new Error("Failed to delete project file")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}
/*
async function updateProjectFile(options: Schema["updateProjectFileProxy"]["args"]): Promise<Schema["FileProxy"]["type"]> {
  const { data, errors } = await client.mutations.updateProjectFileProxy(options)

  if (errors) {
    console.error(errors)
    console.log("options", options)
    throw new Error("Failed to update project file")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}*/

export interface ProjectFileTableProps {
  projectId: string
}

interface PageData {
  items: Array<Schema["ProjectFileProxy"]["type"]>
  previousToken: string | null
  nextToken: string | null
}

export function ProjectFileTable({ projectId }: ProjectFileTableProps) {
  const { ref, inView } = useInView()
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  //const [globalFilter, setGlobalFilter] = useState("")

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
    queryKey: ["project-files", projectId/*globalFilter*/],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<PageData> => {
      const { items, nextToken = null } = await listProjectFiles({ projectId: projectId, nextToken: pageParam/*, query: globalFilter*/, imageOptions: { width: 64, height: 64, format: "webp" } })

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
    getRowId: row => row.fileId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    //onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      //globalFilter,
    },
    meta: {
      onRowAction: handleRowAction
    },
    //manualFiltering: true,
  })

  // wenn neues geinserted wird => getThumbnail oder getMITthumnail?
  // wenn bestendes gelöscht wird => deleteFile




  // todo do not invalidate query, but update the data
  const deleteProjectFileMutation = useMutation({
    mutationFn: deleteProjectFile,
    onSuccess: (file) => {
      if (!file) return;
      queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
        if (!data) return data;

        const { pages, ...rest } = data;

        return {
          pages: pages.map(({ items, ...page }) => ({
            ...page,
            items: items.filter(({ fileId }) => fileId !== file.fileId)
          })),
          ...rest
        };
      })
    },
  })

  const getProjectFileMutation = useMutation({
    mutationFn: getProjectFile,
    onSuccess: (file) => {
      console.log("getFileMutation::file", file)
      if (!file) return;
      queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
        if (!data || data.pages.length < 1) {
          return {
            pages: [{ items: [file], nextToken: null, previousToken: null }],
            pageParams: [null]
          };
        }

        const updatedPages = [...data.pages];
        const lastPageIndex = updatedPages.length - 1;

        updatedPages[lastPageIndex] = {
          ...updatedPages[lastPageIndex],
          items: [...updatedPages[lastPageIndex].items, file]
        };

        return {
          ...data,
          pages: updatedPages
        };
      });
    },
  })

  /*const updateProjectFileMutation = useMutation({
    mutationFn: updateProjectFile,
    onSuccess: (file) => {
      if (!file) return;
      console.log("updateProjectFileMutation::file", file)
      queryClient.setQueryData(["project-files", projectId//, globalFilter//], (data: InfiniteData<PageData> | undefined) => {
        if (!data) return data;

        const { pages, ...rest } = data;

        return { 
          pages: pages.map(({ items, ...page }) => ({
            ...page,
            items: items.map(({ fileId, ...rest }) => fileId === file.id ? { ...rest, file: {...file, resource: rest.file.resource } } : { ...rest })
          })),
          ...rest
        };
      })
    },
  })*/

  function handleRowAction(action: string, record: Schema["ProjectFileProxy"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          deleteProjectFileMutation.mutate({
            fileId: record.fileId,
            projectId: record.projectId,
          })
          break
        case "update":
          /*if (!record?.file) {
            throw new Error("Record is undefined")
          }
          updateProjectFileMutation.mutate({
            projectId: projectId,
            fileId: record.fileId,
            name: record.file.name,
          })*/
          throw new Error("Not implemented")
          break
        case "copy":
          if (!record?.file) {
            throw new Error("File is undefined")
          }
          navigator.clipboard.writeText(record.file.path)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }


  useEffect(() => {
    if (!inView) {
      return
    }
    fetchNextPage()
  }, [fetchNextPage, inView])

  //useEffect(() => { // todo reset pageParam (nextToken) on input change if not automatically updated
  //  queryClient.resetQueries({ or setQueryData
  //    queryKey: ["project-files", projectId]
  //  })
  //}, [globalFilter, queryClient, projectId])


  useEffect(() => {
    const subscription = client.models.ProjectFile.onCreate({
      filter: {
        and: [
          { projectId: { eq: projectId } },
        ]
      },
    }).subscribe({
      next: (file) => {
        console.log("onCreate::file", file)
        getProjectFileMutation.mutate({ projectId, fileId: file.fileId, imageOptions: { width: 64, height: 64, format: "webp" } });
      },
      error: (error) => {
        console.error('onCreate subscription error:', error)
      }
    });

    return () => subscription.unsubscribe();
  }, [projectId, getProjectFileMutation]);

  useEffect(() => {
    const subscription = client.models.ProjectFile.onDelete({
      filter: {
        projectId: { eq: projectId }
      },
      // selectionSet: ["id"]
    }).subscribe({
      next: (file) => {
        queryClient.setQueryData(["project-files", projectId/*, globalFilter*/], (data: InfiniteData<PageData> | undefined) => {
          if (!data) return data;

          const { pages, ...rest } = data;

          return {
            pages: pages.map(({ items, ...page }) => ({
              ...page,
              items: items.filter(({ fileId }) => fileId !== file.fileId)
            })),
            ...rest
          };
        });
      },
      error: (error) => {
        console.error('Delete subscription error:', error)
      }
    });

    return () => subscription.unsubscribe();
  }, [projectId, queryClient/*, globalFilter*/]);

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Filter files..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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