"use client"

import * as React from "react"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
/*
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
*/
import { UserPlus } from "lucide-react"
import { useState } from "react";
import { CreateProjectMembershipFormSchema, CreateProjectMembershipForm, CreateProjectMembershipFormProps } from "./create-project-membership-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils";


const client = generateClient<Schema>();

async function createProjectMembership(options: Schema["createProjectMembershipProxy"]["args"]) {
    const { data, errors } = await client.mutations.createProjectMembershipProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create project membership")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

export interface CreateMemberSheetProps extends Omit<CreateProjectMembershipFormProps, "onSubmit"> {
    closeOnSuccess?: boolean
    projectId: string
}

export function CreateMemberSheet({ closeOnSuccess = true, projectId, className, ...props }: CreateMemberSheetProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const handleSubmit = async (values: CreateProjectMembershipFormSchema) => {
        await handleCreateProjectMembership(values)
        if (closeOnSuccess) {
            setOpen(false)
        }
    }

    async function handleCreateProjectMembership(values: CreateProjectMembershipFormSchema) {
        try {
            for (const accountId of values.users) {
                await createProjectMembershipMutation.mutateAsync({
                    projectId,
                    accountId,
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to create project membership")
        }
    }

    const createProjectMembershipMutation = useMutation({
        mutationFn: createProjectMembership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-memberships', projectId] }) //setOpen(false)
        },
    })

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" className="h-7">
                    Add People
                    <UserPlus className="size-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
                <SheetHeader className="gap-1">
                    <SheetTitle>CreateMember</SheetTitle>
                    <SheetDescription>
                        CreateMember a file to the project
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
                    <CreateProjectMembershipForm onSubmit={handleSubmit} className={cn("flex-1 flex flex-col justify-between", className)} {...props} />
                </div>
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                            Done
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}