"use client"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarMenuSkeleton } from "@/components/ui/sidebar"

import { useQuery } from "@tanstack/react-query";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const client = generateClient<Schema>();

async function fetchProjects() {
  const { data: projects, errors } = await client.models.Project.list();

  if (errors) {
    throw new Error("Failed to fetch projects")
  }

  return projects
}

export function NavProjects() {
  const pathname = usePathname();
  const projectId = pathname.split('/')[2];

  const { data: projects, isPending } = useQuery({// todo add error handling
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const activeProject = projects?.find(project => project.id === projectId);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupAction disabled={isPending}>
        <Plus /> <span className="sr-only">Add Project</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {isPending ? Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}> {/* todo review if li is rendered */}
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))
            : (projects?.length ? projects?.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/projects/${project.id}`} data-active={project.id === activeProject?.id} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                    <span>{project.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SidebarMenuButton variant="outline">
                    Create Project
                  </SidebarMenuButton>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
