"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { File } from "lucide-react";
import { useAppPath } from "@/hooks/use-app-path";

export function NavFilesItem() {
    const appPath = useAppPath()

    if (appPath.error) {
        return null
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={appPath.path === "files"}>
                <Link href={`/projects/${appPath.projectId}/files`}>
                    <File />
                    <span>Files</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}