"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { Users } from "lucide-react";
import { useAppPath } from "@/hooks/use-app-path";

export function NavMembersItem() {
    const appPath = useAppPath()

    if (appPath.error) {
        return null
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={appPath.path === "memberships"}>
                <Link href={`/projects/${appPath.projectId}/memberships`}>
                    <Users />
                    <span>Memberships</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}