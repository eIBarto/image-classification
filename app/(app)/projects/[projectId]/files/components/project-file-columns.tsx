"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Schema } from '@/amplify/data/resource';
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export const columns: Array<ColumnDef<Schema["ProjectFileProxy"]["type"]>> = [
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
        id: "data",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => {
            const { file, updatedAt } = row.original;
            /*return (
                <div className="p-1">
                    <Dialog>
                        <ContextMenu>
                            <ContextMenuTrigger>
                                <DialogTrigger asChild>
                                    <div className="overflow-hidden rounded-md">
                                        <Image
                                            src={file?.resource ?? ""}
                                            alt={file?.name ?? ""}
                                            width={512}
                                            height={512}
                                            priority
                                            className={cn(
                                                "h-auto w-auto object-cover transition-all hover:scale-105",
                                                "aspect-square"
                                                //aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                                            )}
                                        />
                                    </div>
                                </DialogTrigger>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-40">
                                <ContextMenuItem>Add to Library</ContextMenuItem>
                                <ContextMenuSub>
                                    <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                        <ContextMenuItem>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            New Playlist
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                    </ContextMenuSubContent>
                                </ContextMenuSub>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => table.options.meta?.onRowAction?.("delete", row.original)} >Delete <Trash2 className="ml-auto h-4 w-4" /></ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{file?.name}</DialogTitle>
                                <DialogDescription>
                                    desc
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <div className="space-y-1" onClick={row.getToggleSelectedHandler()}>
                        <div className="space-y-1 text-sm">
                            <h3 className="font-medium leading-none max-w-[400px] truncate">{file?.name}</h3>
                            <p className="text-xs text-muted-foreground">{file?.id}</p>
                            <time className="text-xs text-muted-foreground" dateTime={updatedAt}>
                                {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                            </time>
                        </div>
                    </div>
                </div>
            );*/
            return (
                <div className="relative w-full rounded-md overflow-hidden">
                    <AspectRatio className="bg-muted">
                        <Image
                            src={file?.resource ?? ""}
                            alt={file?.name ?? ""}
                            fill
                            className="h-full w-full rounded-md object-cover"
                        />
                    </AspectRatio>
                    <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-sm font-semibold text-white">{file?.name}</h2>
                        <div className="flex items-center gap-2 mb-2 justify-between">
                            {/*<Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-4 bg-black/20 text-white/70 border-0">MOCK</Badge>*/}
                            <div className="flex items-center text-white/70 text-sm gap-1">
                                <Clock className="w-3 h-3" />
                                <time className="text-[10px]" dateTime={updatedAt}>
                                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: false })}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        filterFn: (row, id, filterValue) => {
            const { file } = row.original;
            return file?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false;
        }
    },
]