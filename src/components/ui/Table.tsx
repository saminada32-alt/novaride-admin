import { cn } from '@/lib/utils';

interface Column<T> {
    key: string;
    header: string;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    width?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    onRowClick?: (row: T) => void;
    emptyText?: string;
    loading?: boolean;
}

export function Table<T>({
    columns, data, keyField, onRowClick, emptyText = 'No data found', loading,
}: TableProps<T>) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">

                {/* Head */}
                <thead>
                    <tr className="border-b border-zinc-800">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{ width: col.width }}
                                className={cn(
                                    'px-4 py-3 text-left',
                                    'text-xs font-medium text-zinc-500',
                                    'uppercase tracking-wider',
                                    col.className,
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-zinc-800/50">
                    {loading ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3">
                                        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-16 text-center text-zinc-600 text-sm"
                            >
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={String(row[keyField])}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    'transition-colors duration-100',
                                    onRowClick && 'cursor-pointer hover:bg-zinc-800/30',
                                )}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={cn('px-4 py-3 text-zinc-300', col.className)}
                                    >
                                        {col.render
                                            ? col.render(row, rowIndex)
                                            : String((row as any)[col.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}