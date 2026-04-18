'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Category } from '@/types'
import { categorySchema, ActionResult } from '@/lib/validators'

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

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  return (data ?? []) as Category[]
}

export async function getAllCategories(): Promise<Category[]> {
  const auth = await requireAdmin()
  if ('error' in auth) return []

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .order('sort_order')
  return (data ?? []) as Category[]
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const parsed = categorySchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    type: formData.get('type'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, type } = parsed.data
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  if (!slug) return { error: 'Nome inválido para gerar identificador' }

  const adminClient = createAdminClient()
  const { data: last } = await adminClient
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()
  const sort_order = (last?.sort_order ?? 0) + 1

  const { error } = await adminClient.from('categories').insert({ name, slug, type, sort_order })
  if (error) return { error: error.message.includes('unique') ? 'Já existe uma categoria com esse nome.' : error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').update({ active: !active }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ('error' in auth) return auth

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}
