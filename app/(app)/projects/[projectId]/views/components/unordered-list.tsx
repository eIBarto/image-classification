import { cn } from "@/lib/utils"
import { flexRender, Table } from "@tanstack/react-table"

export interface UnorderedListProps<TData> extends Pick<React.ComponentProps<"ul">, "className"> {
    table: Table<TData>
}


// todo move to components
export function UnorderedList<TData>({ table, className, ...props }: UnorderedListProps<TData>) {

    return (
        <ul className={cn("flex flex-col gap-2", className)} {...props}>
            {table.getRowModel().rows.map((row) => (
                <li
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={"border rounded-lg transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"}
                >
                    {row.getVisibleCells().map((cell) => (
                        <span key={cell.id} >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                    ))}
                </li>
            ))}
        </ul >
    )
}

