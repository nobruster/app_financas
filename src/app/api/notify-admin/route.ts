import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

// Esta rota é chamada pelo Webhook do Supabase quando um novo usuário se cadastra
export async function POST(request: NextRequest) {
  // Verifica o secret para evitar chamadas não autorizadas
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const userEmail = body?.record?.email

  if (!userEmail) {
    return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
  }

  const adminEmail = process.env.ADMIN_EMAIL!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    await resend.emails.send({
      from: 'FinançasPessoais <onboarding@resend.dev>',
      to: adminEmail,
      subject: '🔔 Novo cadastro aguardando aprovação',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Novo cadastro pendente</h2>
          <p style="color: #475569;">Um novo usuário se cadastrou no <strong>FinançasPessoais</strong> e está aguardando sua aprovação.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Email do usuário:</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-weight: 600;">${userEmail}</p>
          </div>
          <a href="${appUrl}/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Acessar painel de aprovação
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">FinançasPessoais — sistema de gestão financeira</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
  }
}
