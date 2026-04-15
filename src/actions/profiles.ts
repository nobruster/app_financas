'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Profile } from '@/types'

export async function createUserByAdmin(email: string, password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return { error: 'Sem permissão' }
  if (password.length < 6) return { error: 'A senha deve ter pelo menos 6 caracteres.' }

  const adminClient = createAdminClient()

  // Cria o usuário via auth admin (sem precisar de confirmação de email)
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // já confirma o email automaticamente
  })

  if (error) {
    if (error.message.includes('already registered')) return { error: 'Este email já está cadastrado.' }
    return { error: error.message }
  }

  // O trigger handle_new_user cria o perfil automaticamente,
  // mas como é criado pelo admin, já aprovamos direto
  if (data.user) {
    await adminClient
      .from('profiles')
      .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return { error: 'Sem permissão' }

  const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved'

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, newStatus }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return { error: 'Sem permissão' }
  if (newPassword.length < 6) return { error: 'A senha deve ter pelo menos 6 caracteres.' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Verifica se é admin antes de buscar todos
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return []

  // Usa service role para bypassar RLS e ver todos os perfis
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []) as Profile[]
}

export async function approveUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return { error: 'Sem permissão' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') return { error: 'Sem permissão' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
