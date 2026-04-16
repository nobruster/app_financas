export type TransactionType = 'income' | 'expense'

export type PaymentMethod = 'dinheiro' | 'pix' | 'conta' | 'debito' | 'credito'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  conta: 'Conta Bancária',
  debito: 'Cartão de Débito',
  credito: 'Cartão de Crédito',
}

// Métodos que contam como "em conta" no dashboard
export const PAYMENT_METHODS_CONTA: PaymentMethod[] = ['pix', 'conta', 'debito', 'credito']

export type CategoryType = 'income' | 'expense' | 'both'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  active: boolean
  sort_order: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category: string
  date: string
  created_at: string
  payment_method: PaymentMethod
  author_email: string | null
}

export interface TransactionFilters {
  month?: number
  year?: number
  category?: string
  type?: TransactionType
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  balance: number
}

export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  approved_at: string | null
  approved_by: string | null
}
