"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Loader2, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
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
import { CreateCategoryNestedDialog } from "./create-category-nested-dialog"
import { CreateCategoryForm, CreateCategoryFormSchema } from "./create-category-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NestedDialog, NestedDialogTrigger, NestedDialogContent, NestedDialogHeader, NestedDialogTitle, NestedDialogDescription } from "@/components/ui/dialog"


const formSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).min(1, "You have to select at least one item."),
  version: z.string().min(1, "Version is required"),
  text: z.string().min(1, "Text is required"),
});

export type CreatePromptVersionFormSchema = z.infer<typeof formSchema>;

export interface CreatePromptVersionFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: CreatePromptVersionFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function CreatePromptVersionForm({ className, onSubmit, resetOnSuccess = true, ...props }: CreatePromptVersionFormProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<CreatePromptVersionFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: undefined,
      text: "",
      categories: [],
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreatePromptVersionFormSchema) => {
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

  const { fields, append, remove, update } = useFieldArray({
    name: "categories",
    control: form.control,
  })

  function handleCreateCategory({ name, description }: CreateCategoryFormSchema) {
    append({ name, description })
  }

  function handleEditCategory(index: number, { name, description }: { name: string, description: string }) {
    update(index, { name, description })
    setIsEditOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="text"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, ...field } }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Text" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Enter the text of the prompt.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="version"
          //disabled={disabled}// || isSubmitting}
          render={({ field: { disabled, onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input type="number" defaultValue={value} onChange={e => onChange(e.target.value)} placeholder="Version" {...field} disabled={disabled || isSubmitting} />
              </FormControl>
              <FormDescription>
                Prompt version
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categories"
          render={() => (//{({ field: { disabled, ...field } }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Categories</FormLabel>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {fields.map((entry, index) => (
                    <Badge key={entry.id} variant="secondary" className="p-0 pl-2 flex flex-row items-center gap-0 h-8">
                      <span className="text-sm font-normal">{entry.name}</span>
                      <NestedDialog identifier="edit-category" open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                              <span className="sr-only">Options for {entry.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <NestedDialogTrigger asChild>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </NestedDialogTrigger>
                            <DropdownMenuItem onClick={() => remove(index)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <NestedDialogContent className="sm:max-w-[475px]">
                          <NestedDialogHeader>
                            <NestedDialogTitle>Edit category</NestedDialogTitle>
                            <NestedDialogDescription>
                              This will edit the category.
                            </NestedDialogDescription>
                          </NestedDialogHeader>
                          <CreateCategoryForm onSubmit={({ name, description }) => handleEditCategory(index, { name, description })} />
                        </NestedDialogContent>
                      </NestedDialog>
                    </Badge>
                  ))
                  }
                  <CreateCategoryNestedDialog trigger={<Button
                    type="button"
                    variant="outline"
                    className="h-8"
                  >
                    Create Category
                  </Button>} onSubmit={handleCreateCategory} />

                </div>

              </div>

              <FormDescription>Add categories to your prompt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Continue"}
        </Button>
      </form>
    </Form>
  )
}


//<FormItem>
//              <FormLabel>Categories</FormLabel>
//              <div className="flex flex-row flex-wrap gap-2 p-1 rounded-md">
//                {fields.map((item, index) => (
//                  <FormField
//                    key={item.id}
//                    control={form.control}
//                    name="items"
//                    render={({ field }) => {
//                      return (
//                        <FormItem>
//                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
//                            <FormControl>
//                              <Checkbox
//                                checked={field.value?.some((value) => value.value === item.id)}
//                                onCheckedChange={(checked) => {
//                                  return checked
//                                    ? field.onChange([...field.value, { value: item.id }])
//                                    : field.onChange(
//                                      field.value?.filter(
//                                        (value) => value.value !== item.id
//                                      )
//                                    )
//                                }}
//                              />
//                            </FormControl>
//                            <div className="flex flex-row items-center gap-2 bg-muted rounded-md p-1">
//                              <span className="text-sm font-normal">{item.value}</span>
//                              <Button variant="ghost" size="icon" onClick={() => remove(index)}>
//                                <Trash2 className="h-4 w-4" />
//                                <span className="sr-only">Remove</span>
//                              </Button>
//                            </div>
//                            {/*<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
//                              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
//                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
//                                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
//                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
//                                </div>
//                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
//                                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
//                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
//                                </div>
//                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
//                                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
//                                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
//                                </div>
//                              </div>
//                            </div>*/}
//                          </FormLabel>
//                        </FormItem>
//                      )
//                    }}
//                  />
//                ))}
//              </div>
//              <CreateCategoryNestedDialog trigger={<Button
//                type="button"
//                variant="outline"
//                size="sm"
//              >
//                Add Item
//              </Button>} onSubmit={handleCreateCategory} />
//              <FormDescription>
//                Select the categories
//              </FormDescription>
//              <FormMessage />
//            </FormItem>

/*<FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.some((value) => value.value === item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, { value: item.id }])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value.value !== item.id
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.value}
                          </FormLabel>
                        </FormItem>*/