import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
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
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastro em análise</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Seu cadastro foi recebido com sucesso! Um administrador irá revisar e aprovar sua conta em breve.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-5 py-4 text-left space-y-2">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">O que acontece agora?</p>
          <ol className="text-sm text-yellow-700 dark:text-yellow-400 list-decimal list-inside space-y-1">
            <li>O administrador recebe uma notificação do seu cadastro</li>
            <li>Sua conta é revisada e aprovada manualmente</li>
            <li>Você recebe acesso completo ao FinançasPessoais</li>
          </ol>
        </div>

        <p className="text-xs text-muted-foreground">
          Conta cadastrada como: <span className="font-medium">{user.email}</span>
        </p>

        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Sair e usar outro email
          </button>
        </form>
      </div>
    </div>
  )
}
