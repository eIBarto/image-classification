"use client"

import Image, { ImageProps } from "next/image"
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
//import { Skeleton } from "@/components/ui/skeleton"

const client = generateClient<Schema>();


type ProjectImage = {
    alt: string
    url: string
}

async function getProjectFileImage(options: Schema["getProjectFileProxy"]["args"]): Promise<ProjectImage> {
    const { data, errors } = await client.queries.getProjectFileProxy(options)

    if (errors) {
        throw new Error("Failed to get file")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    const { resource, name } = data.file

    if (!resource) {
        throw new Error("No resource returned")
    }

    return {
        alt: name,
        url: resource
    }
}

export type ProjectFileImageProps = Schema["getProjectFileProxy"]["args"] & Omit<ImageProps, "src" | "alt" | "width" | "height">

export function ProjectFileImage({ projectId, fileId, imageOptions: { width, height, format }, ...props }: ProjectFileImageProps) {
    const { data, isLoading, error } = useQuery({ // error?
        queryKey: ["project-file-image", projectId, fileId, width, height, format],
        queryFn: () => getProjectFileImage({ projectId, fileId, imageOptions: { width, height, format } })
    })

    if (isLoading) {
        return "Loading image..." //<Skeleton className="w-full h-full" />
    }

    if (!data) {
        return null
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return <Image src={data.url} alt={data.alt} width={width} height={height} {...props} />
}
