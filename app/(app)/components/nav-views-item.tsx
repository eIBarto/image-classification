"use client"

import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link";
import { ChevronRight, ChevronRightIcon, LayoutDashboard } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner";

const client = generateClient<Schema>();

async function listViews(options: Schema["listViewsProxy"]["args"]): Promise<Schema["ListViewsResponse"]["type"]> {
    const { data, errors } = await client.queries.listViewsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects views")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface NavViewsItemProps {
    isActive: boolean
    projectId: string
    viewId?: string | null
}

export function NavViewsItem({ isActive, projectId, viewId }: NavViewsItemProps) {
  
    const {
        data,
        fetchNextPage,
        isLoading,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["views", projectId],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ViewProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listViews({ projectId: projectId, nextToken: pageParam/*, query: query*/ })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch views")
        }
    }, [error])

    const items = useMemo(() => data?.pages?.flatMap(page => page.items) ?? [], [data])

    return (
        <Collapsible
            asChild
            defaultOpen={isActive}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Views" isActive={isActive}>
                        <LayoutDashboard />
                        <span>Views</span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <SidebarMenuSubItem key={index}>
                                    <SidebarMenuSkeleton />
                                </SidebarMenuSubItem>
                            ))
                        ) : (items.map((item) => (
                            <SidebarMenuSubItem key={item.id}>
                                <SidebarMenuSubButton asChild isActive={viewId === item.id}>
                                    <Link href={`/projects/${projectId}/views/${item.id}`}>
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        )))}
                    </SidebarMenuSub>
                    {!isLoading && (hasNextPage ?
                            <SidebarMenuButton className="text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" onClick={() => fetchNextPage()}>
                                <span>Load more</span>
                            </SidebarMenuButton>
                            :
                            <SidebarMenuButton asChild className="text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                                <Link href={`/projects/${projectId}/views`}>
                                    <span>Show all</span>
                                    <ChevronRight className="ml-auto" />
                                </Link>
                            </SidebarMenuButton>
                        )
                    }
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}