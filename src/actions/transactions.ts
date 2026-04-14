'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Transaction, TransactionFilters } from '@/types'

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
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
  return data as Transaction[]
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

  const { error } = await supabase
    .from('transactions')
    .update({
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      date: formData.get('date') as string,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}
