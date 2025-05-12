"use client"

import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    FileIcon,
    Play,
    Pause,
    X,
    Upload,
    CircleCheck,
    CirclePause,
    ListEnd,
    ListCheck,
    CircleAlert,
    Loader2,
    Trash,
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarNextImage
} from '@/components/ui/avatar';
import bytes from 'bytes';
import { Separator } from '@/components/ui/separator';

export interface ProjectFileUploadProps {
    projectId: string
    userId: string
}

export function ProjectFileUpload({ projectId, userId }: ProjectFileUploadProps) {

    return (
        <FileUploader
            acceptedFileTypes={['image/*']}
            path={({ identityId }) => `projects/submissions/${identityId}/${userId}/${projectId}/`}
            maxFileCount={100}
            autoUpload={false}
            isResumable
            components={{
                Container: ({ children }) => (
                    <div className="flex flex-col gap-2">
                        {children}
                    </div>
                ),
                DropZone({ children, displayText, inDropZone, ...rest }) {
                    return (
                        <div
                            className={cn(
                                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg",
                                inDropZone ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                                "justify-end gap-2" // todo revisit when isolating component
                            )}
                            {...rest}
                        >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {displayText.dropFilesText}
                            </p>
                            <Separator />
                            {children}
                        </div>
                    );
                },
                FilePicker({ onClick }) {
                    return (
                        <Button variant="outline" size="sm" onClick={onClick}>
                            Browse Files
                        </Button>
                    );
                },
                FileList({ files, displayText, onResume, onPause, onCancelUpload, onDeleteUpload }) {
                    if (!files.length) return null;

                    return (
                        <Command className="rounded-lg border shadow-md">
                            <CommandList>
                                <CommandEmpty>No files uploaded</CommandEmpty>
                                <CommandGroup heading={displayText.getSelectedFilesText(files.length)}>
                                    {files.map(({ file, key, id, status, uploadTask }) => {
                                        return (
                                            <CommandItem
                                                key={id}
                                                className="flex justify-between py-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className='rounded-sm'>
                                                        {file && <AvatarNextImage src={URL.createObjectURL(file)} alt="Image" width={40} height={40} style={{ objectFit: 'cover' }} />}
                                                        <AvatarFallback className='rounded-sm'>
                                                            <FileIcon className="h-4 w-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                                                            {file ? file.name : key.split('/').pop()}
                                                        </p>
                                                        {file && <p className="text-sm text-muted-foreground">
                                                            {bytes(file.size, { unitSeparator: ' ' })}
                                                        </p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {status === "uploaded" && (<CircleCheck className="h-4 w-4 text-green-500" />)}
                                                    {status === "paused" && (<CirclePause className="h-4 w-4 text-yellow-500" />)}
                                                    {status === "queued" && (<ListCheck className="h-4 w-4 text-blue-500" />)}
                                                    {status === "added" && (<ListEnd className="h-4 w-4 text-muted-foreground" />)}
                                                    {status === "uploading" && (<Loader2 className="h-4 w-4 animate-spin" />)}
                                                    {status === "error" && (<CircleAlert className="h-4 w-4 text-red-500" />)}
                                                    {uploadTask && status === 'paused' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4"
                                                            onClick={() => onResume({ id: id, uploadTask: uploadTask })}
                                                        >
                                                            <Play className="h-3 w-3" />
                                                            <span className="sr-only">Resume</span>
                                                        </Button>
                                                    )}
                                                    {uploadTask && status === 'uploading' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4"
                                                            onClick={() => onPause({ id: id, uploadTask: uploadTask })}
                                                        >
                                                            <Pause className="h-3 w-3" />
                                                            <span className="sr-only">Pause</span>
                                                        </Button>
                                                    )}
                                                    {uploadTask && status === 'uploading' && ( // status queued?
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4"
                                                            onClick={() => onCancelUpload({ id: id, uploadTask: uploadTask })}
                                                        >
                                                            <X className="h-3 w-3" />
                                                            <span className="sr-only">Cancel</span>
                                                        </Button>
                                                    )}
                                                    {(status === 'uploaded' || status === 'error' || status === 'paused' || status === 'queued' || status === 'added') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4"
                                                            onClick={() => onDeleteUpload({ id: id })}
                                                        >
                                                            <Trash className="h-3 w-3" />
                                                            <span className="sr-only">Remove</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    );
                },
                FileListHeader({ displayText, fileCount }) {
                    return (
                        <span className="text-sm text-muted-foreground font-medium">
                            {displayText.getSelectedFilesText(fileCount)}
                        </span>
                    );
                },
                FileListFooter({ displayText, onClearAll, onUploadAll, remainingFilesCount }) {
                    return (
                        <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={onClearAll}>{displayText.clearAllButtonText}</Button>
                            <Button size="sm" onClick={onUploadAll}>{displayText.getUploadButtonText(remainingFilesCount)}</Button>
                        </div>
                    );
                },
            }}
        />
    );
}

