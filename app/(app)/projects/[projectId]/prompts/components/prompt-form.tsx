"use client"
/**
 * Prompt creation form
 * - Compose prompt text and associate labels; supports creating labels inline
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Check, Loader2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import React, { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Tags, Trash2, EditIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LabelForm, LabelFormSchema } from "./label-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea"

const client = generateClient<Schema>();

async function listLabels(options: Schema["listLabelsProxy"]["args"]) {
    const { data, errors } = await client.queries.listLabelsProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to fetch projects labels")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

async function createLabel(options: Schema["createLabelProxy"]["args"]) {
    const { data, errors } = await client.mutations.createLabelProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to create label")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

const formSchema = z.object({
    labels: z.array(z.custom<Schema["LabelProxy2"]["type"]>()).min(1, "You have to select at least one item."),
    text: z.string().min(1, "Name is required"),
});

export type PromptFormSchema = z.infer<typeof formSchema>;

export interface PromptFormProps extends Pick<React.ComponentProps<"form">, "className"> {
    projectId: string
    onSubmit?: (values: PromptFormSchema) => Promise<void | string> | void
    resetOnSuccess?: boolean
    disabled?: boolean
}

export function PromptForm({ className, onSubmit, resetOnSuccess = true, projectId, ...props }: PromptFormProps) {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<PromptFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: "",
            labels: [],
        },
        disabled: props.disabled,
    })

    const { fields, append, remove } = useFieldArray({
        name: "labels",
        control: form.control,
    })

    const { errors, isSubmitting, disabled } = form.formState

    const { data, error } = useInfiniteQuery({
        queryKey: ["project-labels", projectId],
        queryFn: async ({ pageParam }: { pageParam: string | null }) => {
            const { items, nextToken = null } = await listLabels({
                projectId,
                nextToken: pageParam
            })
            return { items, previousToken: pageParam, nextToken }
        },
        initialPageParam: null,
        getPreviousPageParam: (firstPage) => firstPage.previousToken,
        getNextPageParam: (lastPage) => lastPage.nextToken,
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to fetch labels")
        }
    }, [error])

    const items = data?.pages?.flatMap(page => page.items) ?? []

    const createLabelMutation = useMutation({
        mutationFn: createLabel,
        onSuccess: (data) => {
            console.log("MARK: data", data)
            queryClient.invalidateQueries({ queryKey: ["project-labels", projectId] })
            setIsOpen(false)
            append(data)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to create label")
        }
    })

    const handleSubmit = form.handleSubmit(async (values: PromptFormSchema) => {
        try {
            const result = await onSubmit?.(values)
            if (result) {
                throw new Error(result)
            }
            if (resetOnSuccess) {
                form.reset()
            }
        } catch (error) {
            console.error(error)
            form.setError("root", { message: error instanceof Error ? error.message : "An error occurred" })
        }
    })

    async function handleLabel(values: LabelFormSchema) {
        await createLabelMutation.mutateAsync({ projectId: projectId, name: values.name, description: values.description })
    }

    function handleSelectLabel(label: Schema["LabelProxy2"]["type"]) {
        if (fields.some(field => field.name === label.name)) {
            remove(fields.findIndex(field => field.name === label.name))
        } else {
            append(label)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
                <FormField
                    control={form.control}
                    name="text"

                    render={({ field: { disabled, ...field } }) => (
                        <FormItem>

                            <FormControl>
                                <Textarea
                                    className="resize-none max-h-[250px]"

                                    placeholder="Create a version"
                                    {...field}
                                    ref={(textarea) => {
                                        if (textarea) {
                                            textarea.style.height = "0px";
                                            textarea.style.height = textarea.scrollHeight + "px";
                                        }
                                    }}
                                    disabled={disabled || isSubmitting}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-top gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 data-[state=open]:bg-accent"
                            >
                                Labels <Tags />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-56 overflow-hidden rounded-lg p-0"
                            align="end"
                        >
                            <Sidebar collapsible="none" className="bg-transparent">
                                <SidebarContent>
                                    <SidebarGroup className="border-b last:border-none">
                                        <SidebarGroupContent className="gap-0">
                                            <SidebarMenu>
                                                {items.map((item) => (
                                                    <SidebarMenuItem key={item.id}>
                                                        <SidebarMenuButton onClick={() => handleSelectLabel(item)}>
                                                            {item.name}
                                                            {fields.some(field => field.name === item.name) && <Check className="ml-auto" />}
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                    <SidebarGroup>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                <SidebarMenuItem>
                                                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                                        <DialogTrigger asChild>
                                                            <SidebarMenuButton>
                                                                <Plus /> <span>Create Label</span>
                                                            </SidebarMenuButton>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Create New Label</DialogTitle>
                                                                <DialogDescription>
                                                                    Add a new label to organize your prompts.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <LabelForm onSubmit={handleLabel} />
                                                        </DialogContent>
                                                    </Dialog>
                                                </SidebarMenuItem>
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                </SidebarContent>
                            </Sidebar>
                        </PopoverContent>
                    </Popover>
                    <FormField
                        control={form.control}
                        name="labels"
                        render={({ field: { disabled, ...field } }) => (
                            <FormItem className="flex flex-col">

                                <div className="flex flex-wrap gap-2">
                                    {fields.map((item, index) => (
                                        <DropdownMenu key={item.id}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    {...field}
                                                    value={item.name}
                                                    disabled={disabled || isSubmitting}
                                                    variant="outline"
                                                    className="flex h-8 data-[state=open]:bg-muted"
                                                >
                                                    {item.name}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem>
                                                    <EditIcon />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => remove(index)}>
                                                    <Trash2 className="text-muted-foreground" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ))}
                                </div>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button size="icon" className="shrink-0 h-8 w-8 ml-auto" onClick={handleSubmit} disabled={isSubmitting || disabled}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                </div>
                {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
            </form>
        </Form>
    )
}