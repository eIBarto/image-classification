"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { File } from "lucide-react";

interface NavFilesItemProps {
    projectId: string
    isActive: boolean
}

export function NavFilesItem({ projectId, isActive }: NavFilesItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={`/projects/${projectId}/files`}>
                    <File />
                    <span>Files</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}