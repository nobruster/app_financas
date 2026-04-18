import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { validateEnv } from '@/lib/env'
import './globals.css'

validateEnv()

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finanças Gerais',
  description: 'Controle suas finanças de forma simples e visual',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
