'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Profile } from '@/types'
import { passwordSchema, ActionResult } from '@/lib/validators'

type AdminAuth = { userId: string; error?: never }
type AdminAuthError = { error: string; userId?: never }

async function requireAdmin(): Promise<AdminAuth | AdminAuthError> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sem permissão: apenas administradores podem realizar esta ação' }

  return { userId: user.id }
}

export async function createUserByAdmin(email: string, password: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const parsedPassword = passwordSchema.safeParse(password)
  if (!parsedPassword.success) return { error: parsedPassword.error.issues[0].message }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already registered')) return { error: 'Este email já está cadastrado.' }
    return { error: error.message }
  }

  if (data.user) {
    await adminClient
      .from('profiles')
      .update({ status: 'approved', approved_by: auth.userId, approved_at: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleUserStatus(userId: string, currentStatus: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

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

export async function changeUserPassword(userId: string, newPassword: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const parsedPassword = passwordSchema.safeParse(newPassword)
  if (!parsedPassword.success) return { error: parsedPassword.error.issues[0].message }

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
  const auth = await requireAdmin()
  if ('error' in auth) return []

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []) as Profile[]
}

export async function approveUser(userId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: auth.userId,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectUser(userId: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
