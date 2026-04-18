import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { TransactionList } from '@/components/transactions/transaction-list'
import { NewTransactionButton } from '@/components/transactions/new-transaction-button'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminFlag = await isAdmin(user.id)

  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Transações</h1>
        <NewTransactionButton categories={categories} />
      </div>

      <TransactionList
        transactions={transactions}
        categories={categories}
        currentUserId={user.id}
        isAdmin={adminFlag}
      />
    </div>
  )
}
