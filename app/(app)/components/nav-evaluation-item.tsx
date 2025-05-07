"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { File } from "lucide-react";

interface NavEvaluationItemProps {
    projectId: string
    isActive: boolean
}

export function NavEvaluationItem({ projectId, isActive }: NavEvaluationItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={`/projects/${projectId}/evaluation`}>
                    <File />
                    <span>Evaluation</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}