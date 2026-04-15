'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createCategory, toggleCategoryActive, deleteCategory } from '@/actions/categories'
import { Category } from '@/types'

interface CategoryManagerProps {
  categories: Category[]
}

const TYPE_LABEL: Record<string, string> = {
  income: 'Receita',
  expense: 'Despesa',
  both: 'Ambos',
}

export function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initial)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.set('name', name)
    formData.set('type', type)
    const result = await createCategory(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setName('')
    }
    setLoading(false)
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleCategoryActive(id, active)
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c))
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id)
    if (!result?.error) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário de criação */}
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Nome</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Academia"
            className="w-48"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="both">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loading || !name}>
          {loading ? 'Criando...' : '+ Adicionar'}
        </Button>
        {error && <p className="text-sm text-red-500 w-full">{error}</p>}
      </form>

      {/* Lista de categorias */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Nome</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Tipo</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-5 py-3 font-medium text-foreground">{cat.name}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                <td className="px-5 py-3">
                  <Badge variant="secondary">{TYPE_LABEL[cat.type]}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={cat.active ? 'default' : 'secondary'}>
                    {cat.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(cat.id, cat.active)}
                    >
                      {cat.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
