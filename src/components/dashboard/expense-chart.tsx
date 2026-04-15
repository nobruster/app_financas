'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction, Category } from '@/types'

interface ExpenseChartProps {
  transactions: Transaction[]
  categories: Category[]
}

const COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function ExpenseChart({ transactions, categories }: ExpenseChartProps) {
  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug

  const expenses = transactions.filter((t) => t.type === 'expense')

  const dataMap: Record<string, number> = {}
  for (const t of expenses) {
    dataMap[t.category] = (dataMap[t.category] ?? 0) + Number(t.amount)
  }

  const data = Object.entries(dataMap)
    .map(([category, value]) => ({
      name: categoryLabel(category),
      value,
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Nenhuma despesa no período.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart style={{ background: 'transparent' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
