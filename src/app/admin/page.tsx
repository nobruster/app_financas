import { redirect } from 'next/navigation'
import { getAllProfiles, approveUser, rejectUser } from '@/actions/profiles'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/types'
import { ChangePasswordButton } from '@/components/admin/change-password-button'
import { ToggleStatusButton } from '@/components/admin/toggle-status-button'
import { CreateUserButton } from '@/components/admin/create-user-button'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profiles = await getAllProfiles()
  const pending = profiles.filter((p: Profile) => p.status === 'pending')
  const others = profiles.filter((p: Profile) => p.status !== 'pending')

  async function approve(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    await approveUser(userId)
  }

  async function reject(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    await rejectUser(userId)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
        </div>
        <CreateUserButton />
      </div>

      {/* Pendentes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Aguardando aprovação</h2>
          {pending.length > 0 && (
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-card border rounded-lg px-6 py-8 text-center text-muted-foreground">
            Nenhum cadastro pendente.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((profile: Profile) => (
              <div key={profile.id} className="bg-card border rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cadastrado em {formatDate(profile.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <form action={approve}>
                    <input type="hidden" name="userId" value={profile.id} />
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                      Aprovar
                    </button>
                  </form>
                  <form action={reject}>
                    <input type="hidden" name="userId" value={profile.id} />
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                      Rejeitar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Todos os usuários */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Todos os usuários</h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">Cadastro</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Perfil</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map((profile: Profile) => (
                <tr key={profile.id} className={profile.id === user.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                  <td className="px-5 py-3 text-foreground">
                    {profile.email}
                    {profile.id === user.id && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">(você)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      profile.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {profile.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[profile.status]}>
                      {STATUS_LABEL[profile.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {profile.id !== user.id && (
                      <div className="flex gap-2">
                        <ToggleStatusButton
                          userId={profile.id}
                          userEmail={profile.email}
                          currentStatus={profile.status}
                        />
                        <ChangePasswordButton userId={profile.id} userEmail={profile.email} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
