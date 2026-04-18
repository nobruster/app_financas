'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction, Category } from '@/types'
import { CHART_COLORS } from '@/lib/constants'
import { getCategoryLabel } from '@/utils/category'
import { formatCurrency } from '@/utils/format'

interface ExpenseChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export function ExpenseChart({ transactions, categories }: ExpenseChartProps) {
  const data = useMemo(() => {
    const dataMap: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      dataMap[t.category] = (dataMap[t.category] ?? 0) + Number(t.amount)
    }
    return Object.entries(dataMap)
      .map(([category, value]) => ({
        name: getCategoryLabel(category, categories),
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

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
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
