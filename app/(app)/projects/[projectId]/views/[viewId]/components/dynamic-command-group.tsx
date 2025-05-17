import { flexRender, Table } from "@tanstack/react-table"
import {
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"

export interface DynamicCommandGroupProps<TData> extends React.ComponentPropsWithoutRef<typeof CommandGroup> {
    table: Table<TData>
}


// todo move to components
export function DynamicCommandGroup<TData>({ table, children, ...props }: DynamicCommandGroupProps<TData>) {

    const { rows } = table.getRowModel()

    return (
        <CommandGroup {...props}>
            {rows.map((row) => (
                <CommandItem
                    key={row.id}
                    value={row.id}
                    onSelect={row.getToggleSelectedHandler()}
                >

                    {row.getVisibleCells().map((cell) => (
                        <span key={cell.id} >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                    ))}
                </CommandItem>
            ))}
            {children}
        </CommandGroup>
    )
}

