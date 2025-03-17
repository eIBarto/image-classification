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
import { columns } from "./classification-candidate-table-columns"
import { Input } from "@/components/ui/input"
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "./data-table";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
//import { CreateFileDialog } from "./create-project-membership-dialog-drawer";
//import { CreateFileFormSchema } from "./create-project-membership-form";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
//import { Button } from "@/components/ui/button";
const client = generateClient<Schema>();

async function listClassificationCandidates(options: Schema["listClassificationCandidatesProxy"]["args"]): Promise<Schema["ListClassificationCandidatesResponse"]["type"]> {
  const { data, errors } = await client.queries.listClassificationCandidatesProxy(options)

  console.log("data", data)
  if (errors) {
    throw new Error("Failed to fetch files")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}



async function classifyCandidate(options: Schema["classifyCandidateProxy"]["args"]): Promise<Schema["ResultProxy1"]["type"]> {
  const { data, errors } = await client.mutations.classifyCandidateProxy(options)
  console.log("classifyCandidate::data", data)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to classify candidate")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }

  return data
}

async function classifyCandidates(options: Schema["classifyCandidatesProxy"]["args"]): Promise<void> {
  const { data, errors } = await client.mutations.classifyCandidatesProxy(options)
  console.log("classifyCandidates::data", data)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to classify candidates")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }
}

/*async function getClassificationCandidate(options: Schema["getClassificationCandidateProxy"]["args"]): Promise<Schema["ClassificationCandidateProxy"]["type"]> {
  const { data, errors } = await client.queries.getClassificationCandidateProxy(options)

  if (errors) {
    throw new Error("Failed to get file")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  console.log("getFile::data", data)

  return data
}*/

/*async function deleteClassificationCandidate(options: Schema["deleteClassificationCandidateProxy"]["args"]): Promise<Schema["ClassificationCandidateProxy1"]["type"]> {
  const { data, errors } = await client.mutations.deleteClassificationCandidateProxy(options)

  if (errors) {
    throw new Error("Failed to delete project file")
  }

  if (!data) {
    throw new Error("No data returned")
  }

  return data
}*/
/*
async function updateClassificationCandidate(options: Schema["updateClassificationCandidateProxy"]["args"]): Promise<Schema["FileProxy"]["type"]> {
  const { data, errors } = await client.mutations.updateClassificationCandidateProxy(options)

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

export interface ClassificationCandidateTableProps {
  classificationId: string
}

interface PageData {
  items: Array<Schema["ClassificationCandidateProxy1"]["type"]>
  previousToken: string | null
  nextToken: string | null
}

export function ClassificationCandidateTable({ classificationId }: ClassificationCandidateTableProps) {
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
    queryKey: ["classification-candidates", classificationId/*globalFilter*/],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: string | null
    }): Promise<PageData> => {
      const { items, nextToken = null } = await listClassificationCandidates({ classificationId: classificationId, nextToken: pageParam/*, query: globalFilter*/, imageOptions: { width: 64, height: 64, format: "webp" } })

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



  const classifyCandidateMutation = useMutation({
    mutationFn: classifyCandidate,
    onSuccess: (result) => {
      console.log("classifyCandidateMutation::result", result)
      if (!result) return;
      queryClient.setQueryData(["classification-candidates", classificationId], (data: InfiniteData<PageData> | undefined) => {
        if (!data) return data;

        const { pages, ...rest } = data;

        return {
          pages: pages.map(({ items, ...page }) => ({
            ...page,
            items: items.map(({ fileId, ...rest }) => fileId === result.fileId ? { ...rest, status: "COMPLETED", result: result, fileId } : { ...rest, fileId })
          })),
          ...rest
        };
      })
    },
  })

  const classifyCandidatesMutation = useMutation({
    mutationFn: classifyCandidates,
  })
  // todo do not invalidate query, but update the data
  /*const deleteClassificationCandidateMutation = useMutation({
    mutationFn: deleteClassificationCandidate,
    onSuccess: (file) => {
      if (!file) return;
      queryClient.setQueryData(["project-files", projectId, viewId//, globalFilter], (data: InfiniteData<PageData> | undefined) => {
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
    */

  /*const getClassificationCandidateMutation = useMutation({
    mutationFn: getClassificationCandidate,
    onSuccess: (file) => {
      console.log("getFileMutation::file", file)
      if (!file) return;
      queryClient.setQueryData(["project-files", projectId], (data: InfiniteData<PageData> | undefined) => {
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
  })*/

  /*const updateClassificationCandidateMutation = useMutation({
    mutationFn: updateClassificationCandidate,
    onSuccess: (file) => {
      if (!file) return;
      console.log("updateClassificationCandidateMutation::file", file)
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

  useEffect(() => {
    const subscription = client.models.Result.onCreate({
      filter: {
        and: [
          { classificationId: { eq: classificationId } },
        ]
      },
      selectionSet: ["id", "classificationId", "fileId", "labelId", "createdAt", "updatedAt", "confidence", "label.*"]
    }).subscribe({
      next: (result) => {
        console.log("onCreate::result", result)
        queryClient.setQueryData(["classification-candidates", classificationId], (data: InfiniteData<PageData> | undefined) => {
          if (!data) return data;

          const { pages, ...rest } = data;

          return {
            pages: pages.map(({ items, ...page }) => ({
              ...page,
              items: items.map(({ fileId, ...rest }) => fileId === result.fileId ? { ...rest, status: "COMPLETED", result: result, fileId } : { ...rest, fileId })
            })),
            ...rest
          };
        });
      },
      error: (error) => {
        console.error('onCreate subscription error:', error)
      }
    });

    return () => subscription.unsubscribe();
  }, [classificationId, queryClient]);

  /*useEffect(() => {
    const subscription = client.models.Result.onDelete({
      filter: {
        classificationId: { eq: classificationId }
      },
      // selectionSet: ["id"]
    }).subscribe({
      next: (result) => {
        queryClient.setQueryData(["classification-candidates", classificationId], (data: InfiniteData<PageData> | undefined) => {
          if (!data) return data;

          const { pages, ...rest } = data;

          return {
            pages: pages.map(({ items, ...page }) => ({
              ...page,
              items: items.filter(({ fileId }) => fileId !== result.fileId)
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
  }, [classificationId, queryClient]);*/

  function handleRowAction(action: string, record: Schema["ClassificationCandidateProxy1"]["type"] | undefined) {
    try {
      switch (action) {
        case "delete":
          if (!record) {
            throw new Error("Record is undefined")
          }
          //deleteClassificationCandidateMutation.mutate({
          //  fileId: record.fileId,
          //  viewId: record.viewId,
          //  projectId: projectId,//record.projectId,
          //})
          break
        case "update":
          /*if (!record?.file) {
            throw new Error("Record is undefined")
          }
          updateClassificationCandidateMutation.mutate({
            projectId: projectId,
            fileId: record.fileId,
            name: record.file.name,
          })*/
          throw new Error("Not implemented")
          break
        case "classify":
          if (!record?.file) {
            throw new Error("File is undefined")
          }
          console.log("caller classifyCandidateMutation::record", record)
          classifyCandidateMutation.mutate({
            classificationId: classificationId,
            fileId: record.fileId,
          })
          break
        case "copy":
          if (!record?.file) {
            throw new Error("File is undefined")
          }
          navigator.clipboard.writeText(record.file.name)
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
        {/*<EditViewDialog trigger={<Button className="ml-auto">
          Edit View
        </Button>} onSubmit={console.log} />*/}
        <Button variant="outline" disabled={isFetchingNextPage || classifyCandidatesMutation.isPending || Object.values(rowSelection).filter(Boolean).length < 1} onClick={() => {
          classifyCandidatesMutation.mutate({ classificationId, files: Object.entries(rowSelection).filter(([, value]) => value).map(([key]) => key) })
        }}>
          Classify
        </Button>
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