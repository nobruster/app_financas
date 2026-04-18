import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Rate limiting simples em memória (por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) return false

  entry.count++
  return true
}

// Esta rota é chamada pelo Webhook do Supabase quando um novo usuário se cadastra
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
  }

  const secret = request.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const userEmail = body?.record?.email

  if (!userEmail || typeof userEmail !== 'string') {
    return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY não configurada')
    return NextResponse.json({ error: 'Configuração de email ausente' }, { status: 500 })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('ADMIN_EMAIL não configurada')
    return NextResponse.json({ error: 'Configuração de destinatário ausente' }, { status: 500 })
  }

  const senderEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: `Finanças Gerais <${senderEmail}>`,
      to: adminEmail,
      subject: 'Novo cadastro aguardando aprovação',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Novo cadastro pendente</h2>
          <p style="color: #475569;">Um novo usuário se cadastrou no <strong>Finanças Gerais</strong> e está aguardando sua aprovação.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Email do usuário:</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-weight: 600;">${userEmail}</p>
          </div>
          <a href="${appUrl}/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Acessar painel de aprovação
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Finanças Gerais — sistema de gestão financeira</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
  }
}
