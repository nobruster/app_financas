import { Suspense } from 'react'
import { getTransactions } from '@/actions/transactions'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { PeriodFilter } from '@/components/dashboard/period-filter'
import { MONTHS } from '@/lib/constants'

interface DashboardPageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const now = new Date()
  const month = Number(params.month ?? now.getMonth() + 1)
  const year = Number(params.year ?? now.getFullYear())

  const transactions = await getTransactions({ month, year })

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MONTHS[month - 1]} de {year}
          </p>
        </div>
        <Suspense>
          <PeriodFilter />
        </Suspense>
      </div>

      {/* Cards de resumo */}
      <SummaryCards transactions={transactions} />

      {/* Gráfico */}
      <ExpenseChart transactions={transactions} />

      {/* Últimas transações */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Últimas transações</h2>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
