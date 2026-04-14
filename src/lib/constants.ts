export const CATEGORIES = [
  { value: 'alimentacao', label: 'Alimentação', type: 'expense' },
  { value: 'transporte', label: 'Transporte', type: 'expense' },
  { value: 'moradia', label: 'Moradia', type: 'expense' },
  { value: 'saude', label: 'Saúde', type: 'expense' },
  { value: 'educacao', label: 'Educação', type: 'expense' },
  { value: 'lazer', label: 'Lazer', type: 'expense' },
  { value: 'vestuario', label: 'Vestuário', type: 'expense' },
  { value: 'salario', label: 'Salário', type: 'income' },
  { value: 'freelance', label: 'Freelance', type: 'income' },
  { value: 'investimentos', label: 'Investimentos', type: 'income' },
  { value: 'outros', label: 'Outros', type: 'both' },
] as const

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
