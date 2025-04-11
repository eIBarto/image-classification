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
import { useAppPath } from "@/hooks/use-app-path";
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

export function NavViewsItem() {
    const appPath = useAppPath()

    if (appPath.error) {
        return null
    }

    const {
        data,
        fetchNextPage,
        isLoading,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["project-views", appPath.projectId],
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ViewProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listViews({ projectId: appPath.projectId, nextToken: pageParam/*, query: query*/ })

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
            defaultOpen={appPath.path === "views"}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Views" isActive={appPath.path === "views"}>
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
                                <SidebarMenuSubButton asChild isActive={appPath.resourceId === item.id}>
                                    <Link href={`/projects/${appPath.projectId}/views/${item.id}`}>
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        )))}
                    </SidebarMenuSub>
                    {!isLoading && (hasNextPage ?
                            <SidebarMenuButton className="text-sidebar-foreground/70" onClick={() => fetchNextPage()}>
                                <span>Load more</span>
                            </SidebarMenuButton>
                            :
                            <SidebarMenuButton asChild className="text-sidebar-foreground/70">
                                <Link href={`/projects/${appPath.projectId}/views`}>
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