import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/types'

interface SummaryCardsProps {
  transactions: Transaction[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>

      <Card className={balance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
