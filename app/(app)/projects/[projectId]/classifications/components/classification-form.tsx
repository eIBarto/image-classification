"use client"

import { cn } from "@/lib/utils"

import { Loader2 } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PromptSelect } from "./prompt-select"
import { ViewSelect } from "./view-select"
import { Slider } from "@/components/ui/slider"
//import { ManagedUserCommandList } from "./managed-user-command-list"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  viewId: z.string().min(1, "View is required"),
  promptId: z.string().min(1, "Prompt is required"),
  version: z.string().min(1, "Version is required"),
  temperature: z.number().min(0).max(1),
  topP: z.number().min(0).max(1),
  maxLength: z.number().min(1).max(4000)
});

export type ClassificationFormSchema = z.infer<typeof formSchema>;

export interface ClassificationFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: ClassificationFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
  projectId: string
}

export function ClassificationForm({ className, onSubmit, resetOnSuccess = true, projectId, ...props }: ClassificationFormProps) {
  const form = useForm<ClassificationFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      viewId: "",
      promptId: "",
      version: "",
      temperature: 0.5,
      topP: 0.95,
      maxLength: 100,
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: ClassificationFormSchema) => {
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



  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("space-y-4 p-0.5", className)}>
        <FormField
          control={form.control}
          name="name"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Classification Name" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription className="sr-only">
                Classification Name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Classification Description"
                  className="resize-none"
                  {...field}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription className="sr-only">
                Classification Description
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="viewId"
          //disabled={disabled}// || isSubmitting}
          //render={({ field: { disabled, ...field } }) => (
          render={() => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>View</FormLabel>
              <FormControl>
                <ViewSelect projectId={projectId} onSelect={(value) => {
                  form.setValue("viewId", value)
                }} />
              </FormControl>
              <FormDescription className="sr-only">
                View
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="promptId"
          //disabled={disabled}// || isSubmitting}
          //render={({ field: { disabled, ...field } }) => (
          render={() => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <PromptSelect projectId={projectId} onSelect={(value) => {
                  const values = value.split(":")
                  const [promptId = "", version = ""] = values
                  form.setValue("promptId", promptId)
                  form.setValue("version", version)
                }} />
              </FormControl>
              <FormDescription className="sr-only">
                Prompt
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="temperature"
          //disabled={disabled}// || isSubmitting}
          //render={({ field: { disabled, ...field } }) => (
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Temperature</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={[value]}
                  onValueChange={(vals) => {
                    onChange(vals[0]);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Controls randomness. Lower values are more deterministic, higher values are more creative.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topP"
          //disabled={disabled}// || isSubmitting}
          //render={({ field: { disabled, ...field } }) => (
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Top P</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={[value]}
                  onValueChange={(vals) => {
                    onChange(vals[0]);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Nucleus sampling. Lower values create more focused, higher values create more diverse responses. Use either this or Temperature.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxLength"
          //disabled={disabled}// || isSubmitting}
          //render={({ field: { disabled, ...field } }) => (
          render={({ field: { value, onChange } }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Max Length</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={1000}
                  step={10}
                  defaultValue={[value]}
                  onValueChange={(vals) => {
                    onChange(vals[0]);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Max length of the generated response in tokens. Higher values allow for longer, more detailed responses.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Create Classification"}
        </Button>
      </form>
    </Form>
  )
}


