import { getTransactions } from '@/actions/transactions'
import { TransactionList } from '@/components/transactions/transaction-list'
import { NewTransactionButton } from '@/components/transactions/new-transaction-button'

export default async function TransactionsPage() {
  const transactions = await getTransactions()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <NewTransactionButton />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  )
}
