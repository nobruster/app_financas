import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RejectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Acesso não autorizado</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Infelizmente seu cadastro não foi aprovado pelo administrador.
            Entre em contato caso acredite que isso foi um engano.
          </p>
        </div>

        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  )
}
