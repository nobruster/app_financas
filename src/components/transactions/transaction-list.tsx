'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransactionForm } from './transaction-form'
import { deleteTransaction, updateTransaction } from '@/actions/transactions'
import { Transaction, Category } from '@/types'
import { MONTHS } from '@/lib/constants'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  currentUserId: string
  isAdmin: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function authorLabel(email: string | null) {
  if (!email) return null
  return email.split('@')[0]
}

export function TransactionList({ transactions, categories, currentUserId, isAdmin }: TransactionListProps) {
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterMonth !== 'all') {
      const month = new Date(t.date + 'T00:00:00').getMonth() + 1
      if (String(month) !== filterMonth) return false
    }
    return true
  })

  function canEdit(t: Transaction) {
    return isAdmin || t.user_id === currentUserId
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return
    const result = await updateTransaction(editing.id, formData)
    if (!result.error) setEditing(null)
    return result
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteTransaction(deleting.id)
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterMonth} onValueChange={(v) => v && setFilterMonth(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(v) => v && setFilterType(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-card text-card-foreground rounded-lg border px-4 py-3 gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">
                  {t.type === 'income' ? '↑' : '↓'}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabel(t.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    {t.author_email && (
                      <span className="text-xs text-muted-foreground">
                        por <span className="font-medium">{authorLabel(t.author_email)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                {canEdit(t) && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleting(t)}>
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editar */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>
          {editing && (
            <TransactionForm
              transaction={editing}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transação</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja excluir <strong>{deleting?.description}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleting(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
