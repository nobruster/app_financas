export type TransactionType = 'income' | 'expense'

export type Category =
  | 'alimentacao'
  | 'transporte'
  | 'moradia'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'vestuario'
  | 'salario'
  | 'freelance'
  | 'investimentos'
  | 'outros'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category: Category
  date: string
  created_at: string
}

export interface TransactionFilters {
  month?: number
  year?: number
  category?: Category
  type?: TransactionType
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  balance: number
}
