'use client'

import { usePathname } from 'next/navigation'
import { UserGuide, HelpButton } from '@/components/user-guide'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <>
      {children}
      <UserGuide currentPath={pathname} />
      <HelpButton />
    </>
  )
}
