"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import type { Schema } from "@/amplify/data/resource"

const accessRoles = [
    { value: "VIEW", label: "View" },
    { value: "MANAGE", label: "Manage" },
] as const

export interface UserDataColumnsProps {
    projectId: string
    onUpdateAccess: (data: { projectId: string; accountId: string; access: Schema["AccessProxy"]["type"] }) => void
    onDelete: (data: { projectId: string; accountId: string }) => void
}

export function useUserDataColumns({ projectId, onUpdateAccess, onDelete }: UserDataColumnsProps): ColumnDef<Schema["ProjectMembershipProxy"]["type"]>[] {
    return [
        {
            accessorKey: "user.email",
            header: "Email",
            cell: ({ row }) => <span className="lowercase">{row.original.user.email}</span>,
        },
        {
            accessorKey: "access",
            header: "Access",
            cell: ({ row }) => (
                <Select defaultValue={row.original.access} onValueChange={(value: Schema["AccessProxy"]["type"]) => {
                    onUpdateAccess({
                        projectId,
                        accountId: row.original.accountId,
                        access: value,
                    });
                }}>
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {accessRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete({
                        projectId,
                        accountId: row.original.accountId,
                    })}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
        },
    ]
}