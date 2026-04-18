import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants'

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`)

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { error: 'Tipo inválido' }),
  amount: z
    .number({ error: 'Valor inválido' })
    .positive('O valor deve ser positivo')
    .max(999_999_999, 'Valor muito alto'),
  description: z
    .string()
    .min(1, 'Descrição obrigatória')
    .max(200, 'Descrição muito longa'),
  category: z.string().min(1, 'Categoria obrigatória'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  payment_method: z.enum(['dinheiro', 'pix', 'conta', 'debito', 'credito'], {
    message: 'Forma de pagamento inválida',
  }),
})

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  type: z.enum(['income', 'expense', 'both'], { message: 'Tipo inválido' }),
})

export type ActionResult = {
  success?: boolean
  error?: string
  newStatus?: string
}
