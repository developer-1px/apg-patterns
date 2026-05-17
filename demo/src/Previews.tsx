import type { ReactNode } from 'react'

export function PreviewSection({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  return (
    <section className={['rounded-md border bg-white p-2 dark:bg-zinc-950', active ? 'border-zinc-300 dark:border-zinc-700' : 'border-zinc-200 dark:border-zinc-800'].join(' ')}>
      <h3 className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">{title}</h3>
      {children}
    </section>
  )
}
