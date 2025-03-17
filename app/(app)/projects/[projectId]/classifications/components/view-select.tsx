"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

async function getViews(options: Schema["listViewsProxy"]["args"]) {
    const { data, errors } = await client.queries.listViewsProxy(options)

    if (errors) {
        throw new Error("Failed to get views")
    }

    if (!data) {
        throw new Error("No views found")
    }

    return data
}

export interface ViewSelectProps {
    projectId: string
    onSelect?: (value: string) => void
}

export function ViewSelect({ projectId, onSelect }: ViewSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleSelect = (value: string) => {
        setValue(value)
        setOpen(false)
        onSelect?.(value)
    }

    const { data: views, isLoading } = useQuery({
        queryKey: ["view-select", projectId],
        queryFn: () => getViews({
            projectId: projectId,
        }),
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                >
                    {value ? views?.items.find((view) => view.id === value)?.name : "Select view..."} {isLoading ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                        <CommandEmpty>No view found.</CommandEmpty>
                        <CommandGroup>
                            {views?.items.map((view) => (
                                <CommandItem
                                    key={view.id}
                                    value={view.id}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === view.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {view.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
