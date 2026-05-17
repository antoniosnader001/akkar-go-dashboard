import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

export function DataTable<T>({
  rows,
  columns,
}: {
  rows: T[]
  columns: Column<T>[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/50 backdrop-blur">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white/80 backdrop-blur z-10">
            <tr className="border-b border-border/70">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={[
                    'px-4 py-3 font-semibold text-muted',
                    c.headerClassName ?? '',
                  ].join(' ')}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-muted"
                >
                  No results
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/60 last:border-b-0 hover:bg-forest/5"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={['px-4 py-3 align-top', c.className ?? ''].join(' ')}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
