'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Transaction, TransactionFilters } from '@/types'
import { transactionSchema, ActionResult } from '@/lib/validators'
import { isAdmin } from '@/lib/auth'

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
  if (error) {
    console.error('Erro ao buscar transações:', error.message)
    throw new Error('Falha ao carregar transações. Tente novamente.')
  }
  if (data.length === 0) return []

  // Busca emails dos autores em batch (evita N+1)
  const userIds = [...new Set(data.map((t) => t.user_id))]
  const adminClient = createAdminClient()
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, email')
    .in('id', userIds)

  const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]))

  return data.map((t) => ({
    ...t,
    author_email: emailMap.get(t.user_id) ?? null,
  })) as Transaction[]
}

export async function createTransaction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const parsed = transactionSchema.safeParse({
    type: formData.get('type'),
    amount: Number(formData.get('amount')),
    description: formData.get('description'),
    category: formData.get('category'),
    date: formData.get('date'),
    payment_method: formData.get('payment_method') || 'dinheiro',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    ...parsed.data,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function updateTransaction(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const parsed = transactionSchema.safeParse({
    type: formData.get('type'),
    amount: Number(formData.get('amount')),
    description: formData.get('description'),
    category: formData.get('category'),
    date: formData.get('date'),
    payment_method: formData.get('payment_method') || 'dinheiro',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const adminCheck = await isAdmin(user.id)

  if (adminCheck) {
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('transactions')
      .update(parsed.data)
      .eq('id', id)
    if (error) return { error: error.message }
  } else {
    // Verifica ownership explicitamente antes de atualizar
    const { data: existing } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return { error: 'Transação não encontrada' }
    if (existing.user_id !== user.id) return { error: 'Sem permissão para editar esta transação' }

    const { error } = await supabase
      .from('transactions')
      .update(parsed.data)
      .eq('id', id)
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const adminCheck = await isAdmin(user.id)

  if (adminCheck) {
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
  } else {
    // Verifica ownership explicitamente antes de excluir
    const { data: existing } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) return { error: 'Transação não encontrada' }
    if (existing.user_id !== user.id) return { error: 'Sem permissão para excluir esta transação' }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  return { success: true }
}
