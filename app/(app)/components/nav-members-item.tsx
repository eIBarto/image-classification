"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { Users } from "lucide-react";

interface NavMembersItemProps {
    projectId: string
    isActive: boolean
}


export function NavMembersItem({ projectId, isActive }: NavMembersItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={`/projects/${projectId}/memberships`}>
                    <Users />
                    <span>Memberships</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}