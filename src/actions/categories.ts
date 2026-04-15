'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Category } from '@/types'

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
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .order('sort_order')
  return (data ?? []) as Category[]
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Sem permissão' }

  const name = (formData.get('name') as string).trim()
  const type = formData.get('type') as string
  const slug = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

  const adminClient = createAdminClient()
  const { data: last } = await adminClient.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const sort_order = (last?.sort_order ?? 0) + 1

  const { error } = await adminClient.from('categories').insert({ name, slug, type, sort_order })
  if (error) return { error: error.message.includes('unique') ? 'Já existe uma categoria com esse nome.' : error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function toggleCategoryActive(id: string, active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Sem permissão' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').update({ active: !active }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Sem permissão' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}
