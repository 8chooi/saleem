import type { ReactNode } from 'react'

export const runtime = 'edge'

export default function ChildLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
