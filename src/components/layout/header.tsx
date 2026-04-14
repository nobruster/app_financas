'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userEmail: string
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="font-semibold text-gray-900">FinançasPessoais</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
