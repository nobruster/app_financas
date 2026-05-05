import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { formatCurrency } from '@/utils/format'

export default async function DashboardPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Todas as transações</p>
      </div>

      {/* Cards de resumo */}
      <SummaryCards transactions={transactions} />

      {/* Gráfico */}
      <ExpenseChart transactions={transactions} categories={categories} />

      {/* Últimas transações */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Últimas transações</h2>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-card text-card-foreground rounded-lg border px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {t.author_email && (
                      <> · por <span className="font-medium">{t.author_email.split('@')[0]}</span></>
                    )}
                  </p>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
