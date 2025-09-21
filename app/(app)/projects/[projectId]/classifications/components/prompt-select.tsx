"use client"
/**
 * Select a prompt version to use for a classification
 */

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

async function getPrompts(options: Schema["listPromptsProxy"]["args"]) {
    const { data, errors } = await client.queries.listPromptsProxy(options)

    if (errors) {
        throw new Error("Failed to get prompts")
    }

    if (!data) {
        throw new Error("No prompts found")
    }

    return data
}

export interface PromptSelectProps {
    projectId: string
    onSelect?: (value: string) => void
}

export function PromptSelect({ projectId, onSelect }: PromptSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleSelect = (value: string) => {
        setValue(value)
        setOpen(false)
        onSelect?.(value)
    }

    const { data: prompts, isLoading } = useQuery({
        queryKey: ["prompt-select", projectId],
        queryFn: () => getPrompts({
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
                    {value ? prompts?.items.flatMap((prompt) => prompt.versions).find((promptVersion) => `${promptVersion?.promptId}:${promptVersion?.version}` === value)?.text : "Select prompt..."} {isLoading ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="end">
                <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                        <CommandEmpty>No prompt found.</CommandEmpty>
                        {prompts?.items.map((prompt) => (
                            <CommandGroup key={prompt.id} heading={prompt.summary}>
                                {prompt.versions?.map((promptVersion) => (
                                    <CommandItem
                                        key={promptVersion.version}
                                        value={`${prompt.id}:${promptVersion.version}`}
                                        onSelect={handleSelect}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === promptVersion.text ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {promptVersion.text}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
