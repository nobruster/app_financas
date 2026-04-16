import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction, PAYMENT_METHODS_CONTA } from '@/types'

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

  // Saldo em dinheiro (espécie): receitas em dinheiro - despesas em dinheiro
  const incomeCash = transactions
    .filter((t) => t.type === 'income' && t.payment_method === 'dinheiro')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenseCash = transactions
    .filter((t) => t.type === 'expense' && t.payment_method === 'dinheiro')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const balanceCash = incomeCash - expenseCash

  // Saldo em conta (PIX, conta, débito, crédito)
  const incomeAccount = transactions
    .filter((t) => t.type === 'income' && PAYMENT_METHODS_CONTA.includes(t.payment_method))
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenseAccount = transactions
    .filter((t) => t.type === 'expense' && PAYMENT_METHODS_CONTA.includes(t.payment_method))
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const balanceAccount = incomeAccount - expenseAccount

  return (
    <div className="space-y-4">
      {/* Linha 1: Receitas, Despesas, Saldo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>

        <Card className={balance >= 0 ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900' : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: Em dinheiro e Em conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">💵 Em dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balanceCash >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(balanceCash)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{formatCurrency(incomeCash)} / -{formatCurrency(expenseCash)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🏦 Em conta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balanceAccount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(balanceAccount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{formatCurrency(incomeAccount)} / -{formatCurrency(expenseAccount)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
