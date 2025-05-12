"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { DataTable } from "../components/data-table"
import { useUserDataColumns } from "./user-data-columns"
import { toast } from "sonner"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"

const client = generateClient<Schema>()

async function listProjectMemberships(options: Schema["listProjectMembershipsByProjectProxy"]["args"]) {
    const { data, errors } = await client.queries.listProjectMembershipsByProjectProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch project memberships")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function updateProjectMembership(input: Schema["updateProjectMembershipProxy"]["args"]) {
    const { data, errors } = await client.mutations.updateProjectMembershipProxy(input)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to update project membership")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function deleteProjectMembership(input: Schema["deleteProjectMembershipProxy"]["args"]) {
    const { data, errors } = await client.mutations.deleteProjectMembershipProxy(input)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to delete project membership")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

export interface UserDataTableProps {
    projectId: string
}

export function UserDataTable({ projectId }: UserDataTableProps) {
    const queryClient = useQueryClient()

    const { data: projectMemberships, error } = useQuery({ // todo isLoading
        queryKey: ['project-memberships', projectId],
        queryFn: () => listProjectMemberships({ projectId }),
    })

    const updateProjectMembershipMutation = useMutation({
        mutationFn: updateProjectMembership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-memberships", projectId] })
            toast.success("Project membership updated")
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update project membership")
        }
    })

    const deleteProjectMembershipMutation = useMutation({
        mutationFn: deleteProjectMembership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-memberships", projectId] })
            toast.success("Project membership deleted")
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete project membership")
        }
    })

    const columns = useUserDataColumns({
        projectId,
        onUpdateAccess: (data) => updateProjectMembershipMutation.mutate(data),
        onDelete: (data) => deleteProjectMembershipMutation.mutate(data),
    })

    const table = useReactTable({
        data: projectMemberships?.items ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (error) {
        console.error(error)
        toast.error("Failed to fetch project memberships")
    }

    return (
        <DataTable
            table={table}
            columns={columns}
        />
    )
}
