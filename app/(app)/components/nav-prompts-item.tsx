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
import { ChevronRightIcon, MessagesSquare } from "lucide-react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

const client = generateClient<Schema>();

async function listPrompts(options: Schema["listPromptsProxy"]["args"]) {
    const { data, errors } = await client.queries.listPromptsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch prompts")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface NavPromptsItemProps {
    isActive: boolean
    projectId: string
    promptId?: string | null
}

export function NavPromptsItem({ isActive, projectId, promptId }: NavPromptsItemProps) {
    const {
        data,
        fetchNextPage,
        isLoading,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ["prompts", projectId],
        //enabled: !appPath.error,
        queryFn: async ({
            pageParam,
        }: {
            pageParam: string | null
        }): Promise<{
            items: Array<Schema["PromptProxy"]["type"]>
            previousToken: string | null
            nextToken: string | null,
        }> => {
            const { items, nextToken = null } = await listPrompts({ projectId: projectId, nextToken: pageParam/*, query: query*/ })

            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch prompts")
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
                    <SidebarMenuButton tooltip="Prompts" isActive={isActive}>
                        <MessagesSquare />
                        <span>Prompts</span>
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
                                <SidebarMenuSubButton asChild isActive={promptId === item.id}>
                                    <Link href={`/projects/${projectId}/prompts/${item.id}`}>
                                        <span>{item.summary}</span>
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
                            <Link href={`/projects/${projectId}/prompts`}>
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