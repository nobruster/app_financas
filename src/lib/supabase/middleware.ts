import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const publicRoutes = ['/login', '/signup', '/pending', '/rejected', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = pathname.startsWith('/admin')

  // Não autenticado → login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Autenticado em rota pública → dashboard
  if (user && isPublicRoute && !pathname.startsWith('/pending') && !pathname.startsWith('/rejected') && !pathname.startsWith('/reset-password')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Autenticado → checar status do perfil
  if (user && !isPublicRoute) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Se service role key não está configurada, delega checagem ao layout
    if (!serviceKey || serviceKey === 'your-service-role-key') {
      return supabaseResponse
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminClient
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.status === 'pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/pending'
      return NextResponse.redirect(url)
    }

    if (profile.status === 'rejected') {
      const url = request.nextUrl.clone()
      url.pathname = '/rejected'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
