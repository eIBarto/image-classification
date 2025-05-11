"use client"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarMenuSkeleton } from "@/components/ui/sidebar"

import { useQuery } from "@tanstack/react-query";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

const client = generateClient<Schema>();

async function listProjects(options: Schema["listProjectsProxy"]["args"]) {
  const { data, errors } = await client.queries.listProjectsProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch projects projects")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }

  return data
}

export function NavProjects() {

  const { data: projects, isPending, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects({}),
  })

  useEffect(() => {
    if (error) {
      console.error(error)
      toast.error("Failed to fetch projects")
    }
  }, [error])

  console.log(projects)

  //const activeProject = projects?.items.find(project => project.id === projectId);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {(isPending || !projects) ? Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))
            : (projects?.items.length ? projects?.items.map(({ project }) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/projects/${project.id}`} /*data-active={project.id === activeProject?.id}*/ className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
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
