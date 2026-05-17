import type { ReactNode } from 'react'

export function PreviewSection({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  return (
    <section className={['bg-white p-2 dark:bg-zinc-950', active ? 'bg-zinc-50 dark:bg-zinc-900/70' : ''].join(' ')}>
      <h3 className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">{title}</h3>
      {children}
    </section>
  )
}
