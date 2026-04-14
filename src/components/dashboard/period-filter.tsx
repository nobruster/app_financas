'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MONTHS } from '@/lib/constants'

export function PeriodFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const selectedMonth = searchParams.get('month') ?? String(currentMonth)
  const selectedYear = searchParams.get('year') ?? String(currentYear)

  function handleChange(key: 'month' | 'year', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/dashboard?${params.toString()}`)
  }

  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i))

  return (
    <div className="flex gap-2">
      <Select value={selectedMonth} onValueChange={(v) => handleChange('month', v)}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={(v) => handleChange('year', v)}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
