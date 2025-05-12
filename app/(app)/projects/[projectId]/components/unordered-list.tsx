import { cn } from "@/lib/utils"
import { flexRender, Table } from "@tanstack/react-table"
import { Check } from "lucide-react"

export interface UnorderedListProps<TData> extends Pick<React.ComponentProps<"ul">, "className"> {
    table: Table<TData>
}


// todo move to components
export function UnorderedList<TData>({ table, className, ...props }: UnorderedListProps<TData>) {

    return (
        <ul className={cn("grid auto-rows-min gap-4 md:grid-cols-4", className)} {...props}>
            {table.getRowModel().rows.map((row) => (
                <li
                    key={row.id}
                    className={"group relative cursor-pointer border-2 rounded-lg hover:bg-muted/50"}
                >

                    {row.getVisibleCells().map((cell) => (
                        <span key={cell.id} >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                    ))}
                    {row.getIsSelected() && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-2 w-2" />
                        </div>
                    )}
                </li>
            ))}
        </ul >
    )
}

