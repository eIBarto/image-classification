"use client"

import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link";
import { ChevronRightIcon, Play } from "lucide-react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

const client = generateClient<Schema>();

async function listClassifications(options: Schema["listClassificationsProxy"]["args"]) {
    const { data, errors } = await client.queries.listClassificationsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch classifications")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface NavClassificationsItemProps {
    isActive: boolean
    projectId: string
    classificationId?: string | null
}

export function NavClassificationsItem({ isActive, projectId, classificationId }: NavClassificationsItemProps) {
    const {
        data,
        fetchNextPage,
        isLoading,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["project-classifications", projectId],
        //enabled: !appPath.error,
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["ClassificationProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listClassifications({ projectId: projectId, nextToken: pageParam/*, query: query*/ })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch classifications")
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
                    <SidebarMenuButton tooltip="Classifications" isActive={isActive}>
                        <Play />
                        <span>Classifications</span>
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
                                <SidebarMenuSubButton asChild isActive={classificationId === item.id}>
                                    <Link href={`/projects/${projectId}/classifications/${item.id}`}>
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
                            <Link href={`/projects/${projectId}/classifications`}>
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