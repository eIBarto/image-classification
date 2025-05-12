import { cn } from "@/lib/utils"
import { flexRender, Table } from "@tanstack/react-table"
import { Check } from "lucide-react"

export interface UnorderedListProps<TData> extends Pick<React.ComponentProps<"ul">, "className"> {
    table: Table<TData>
}


// todo move to components
export function UnorderedList<TData>({ table, className, ...props }: UnorderedListProps<TData>) {

    return (
        <ul className={cn("grid", className)} {...props}>
            {table.getRowModel().rows.map((row) => (
                <li
                    //onClick={row.getToggleSelectedHandler()}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn("group relative cursor-pointer border-2 rounded-lg transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                        row.getIsSelected() && "border-primary"
                    )}
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

