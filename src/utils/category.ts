import { Category } from '@/types'

export function getCategoryLabel(slug: string, categories: Category[]): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug
}
