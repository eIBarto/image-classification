import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useQuery } from '@tanstack/react-query';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

const client = generateClient<Schema>();

export interface ProjectImageProps extends Omit<React.ComponentPropsWithoutRef<typeof AspectRatio>, "children"> {
    projectId: string;
    fileId: string;

}

async function getProjectFile(options: Schema["getProjectFileProxy"]["args"]) {
    const { data, errors } = await client.queries.getProjectFileProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to get project file")
    }

    if (!data) {
        throw new Error("No data returned")
    }

    return data
}

export function ProjectImage({ projectId, fileId, ...props}: ProjectImageProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['project', projectId, fileId],
        queryFn: () => getProjectFile({ projectId, fileId, imageOptions: { width: 1024, height: 1024, format: "webp" } }),
    })

    return (
        <AspectRatio {...props}>
            {isLoading ? (
                <Skeleton className="w-full h-full" />
            ) : data?.file?.resource ? (
                <Image sizes="auto" src={data.file.resource} alt={data.file.name ?? ""} fill style={{ objectFit: 'cover' }}/>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
        </AspectRatio>
    )
}