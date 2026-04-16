'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Category, Transaction, PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types'

interface TransactionFormProps {
  transaction?: Transaction
  categories: Category[]
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>
  onCancel?: () => void
}

export function TransactionForm({ transaction, categories, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? 'expense')
  const [category, setCategory] = useState(transaction?.category ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.payment_method ?? 'dinheiro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('type', type)
    formData.set('category', category)
    formData.set('payment_method', paymentMethod)

    const result = await onSubmit(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Tipo */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory('') }}
            className={`py-2 px-4 rounded-md text-sm font-medium border transition-colors ${
              type === 'expense'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory('') }}
            className={`py-2 px-4 rounded-md text-sm font-medium border transition-colors ${
              type === 'income'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          defaultValue={transaction?.amount}
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          placeholder="Ex: Supermercado, Salário..."
          defaultValue={transaction?.description}
          required
        />
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v)} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Forma de pagamento */}
      <div className="space-y-2">
        <Label>Forma de pagamento</Label>
        <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v as PaymentMethod)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={transaction?.date ?? today}
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !category} className="flex-1">
          {loading ? 'Salvando...' : transaction ? 'Salvar alterações' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
