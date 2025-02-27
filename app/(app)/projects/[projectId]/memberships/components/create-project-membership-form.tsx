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
import { ProjectMembershipUserTable } from "./project-membership-user-table"
import { useCallback } from "react"
//import { ManagedUserCommandList } from "./managed-user-command-list"

const formSchema = z.object({
  users: z.array(z.string()).min(1, "A user must be selected"),
});

export type CreateProjectMembershipFormSchema = z.infer<typeof formSchema>;

export interface CreateProjectMembershipFormProps extends Pick<React.ComponentProps<"form">, "className"> {
  onSubmit?: (values: CreateProjectMembershipFormSchema) => Promise<void | string> | void
  resetOnSuccess?: boolean
  disabled?: boolean
}

export function CreateProjectMembershipForm({ className, onSubmit, resetOnSuccess = true, ...props }: CreateProjectMembershipFormProps) {
  const form = useForm<CreateProjectMembershipFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: [],
    },
    disabled: props.disabled,
  })

  const { errors, isSubmitting, disabled } = form.formState

  const handleSubmit = form.handleSubmit(async (values: CreateProjectMembershipFormSchema) => {
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
  
  const handleUserSelect = useCallback(
    ([user]: string[]) => {
      form.setValue("users", user ? [user] : [])
    },
    [form]
  )


  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="users"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users</FormLabel>
              <FormControl>
                <ProjectMembershipUserTable onSelect={handleUserSelect} value={field.value} /*disabled={disabled || isSubmitting}*/ />
              </FormControl>
              <FormDescription>
                All available users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.root && <FormMessage>{errors.root.message}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isSubmitting || disabled}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Create Membership"}
        </Button>
      </form>
    </Form>
  )
}