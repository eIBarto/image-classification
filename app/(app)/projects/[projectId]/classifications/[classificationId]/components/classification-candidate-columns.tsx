"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ClassificationCandidateRowActions } from "./classification-candidate-row-actions";
import { ClassificationCandidateRowOptions } from "./classification-candidate-row-options";


export const columns: Array<ColumnDef<Schema["ClassificationCandidateProxy1"]["type"]>> = [
    {
        accessorKey: "createdAt",
        enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "updatedAt",
        enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "name",
        enableHiding: false,
        enableSorting: true,
        sortingFn: (a, b) => {
            const aName = a.original.file?.name ?? "";
            const bName = b.original.file?.name ?? "";
            return aName.localeCompare(bName);
        },
    },
    {
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file, result } = row.original;

            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <ClassificationCandidateRowActions row={row} table={table} />
                    {/*<ContextMenu>    
                        <ContextMenuTrigger>
                            <AspectRatio className="bg-muted">
                                <Image
                                    src={file?.resource ?? ""}
                                    alt={file?.name ?? ""}
                                    fill
                                    className="h-full w-full rounded-md object-cover"
                                />
                            </AspectRatio>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-40">
                            <ContextMenuItem onClick={() => table.options.meta?.onRowAction?.("classify", row.original)}>Classify</ContextMenuItem>
                            <ContextMenuItem onClick={() => table.options.meta?.onRowAction?.("delete", row.original)}>Delete Result</ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuSub>
                                <ContextMenuSubTrigger>Add to Collection</ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48">
                                    <ContextMenuItem>
                                        <Plus /> <span>Create Label</span>
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                </ContextMenuSubContent>
                            </ContextMenuSub>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                onClick={() => table.options.meta?.onRowAction?.("delete", row.original)}
                                className="text-destructive"
                            >
                                Delete <Trash2 className="ml-auto h-4 w-4" />
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>*/}
                    <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-sm font-semibold text-white">{file?.name}</h2>
                        <div className="flex items-center gap-2 mb-2 justify-between">
                            {result && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/20 text-white/70 border-0">{result.label?.name}</Badge>}
                            {file && <div className="flex items-center text-white/70 text-sm gap-1">
                                <span className="text-[10px]">{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                                <Clock className="w-3 h-3" />   
                            </div>}
                        </div>
                    </div>
                    <div className="absolute top-2 right-2">
                        <ClassificationCandidateRowOptions row={row} table={table} />
                    </div>
                </div>
            )
        },
        filterFn: (row, id, filterValue) => {
            const { file } = row.original;
            return file?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false;
        },
    },
    /*{
        accessorKey: "status",
        enableHiding: true,
        enableSorting: true,
        cell: ({ row }) => {
            const { result } = row.original;
            return (
                <div className="flex justify-between gap-1 p-1 items-top flex-wrap">
                    {result && (
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">{result.label?.name}</Badge>
                        </div>
                    )}
                    <Button variant="outline" className="h-6 w-6 p-0 ml-auto">
                        <Settings2 className="h-2 w-2" />
                    </Button>
                </div>
            )
        }
    },*/
]