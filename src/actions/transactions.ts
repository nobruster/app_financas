'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Transaction, TransactionFilters } from '@/types'

async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'admin'
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Busca todas as transações da família
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.month && filters?.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0)
      .toISOString()
      .split('T')[0]
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) return []
  if (data.length === 0) return []

  // Busca os emails dos autores em uma única consulta
  const userIds = [...new Set(data.map((t) => t.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', userIds)

  const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]))

  return data.map((t) => ({
    ...t,
    author_email: emailMap.get(t.user_id) ?? null,
  })) as Transaction[]
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: formData.get('type') as string,
    amount: Number(formData.get('amount')),
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string || 'dinheiro',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Admin usa cliente sem RLS, usuário comum só edita o próprio
  const client = (await isAdmin(user.id)) ? createAdminClient() : supabase

  const { error } = await client
    .from('transactions')
    .update({
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      payment_method: formData.get('payment_method') as string || 'dinheiro',
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Admin usa cliente sem RLS, usuário comum só exclui o próprio
  const client = (await isAdmin(user.id)) ? createAdminClient() : supabase

  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}
