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
  const publicRoutes = ['/login', '/signup', '/pending', '/rejected']
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = pathname.startsWith('/admin')

  // Não autenticado → login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Autenticado em rota pública → dashboard
  if (user && isPublicRoute && !pathname.startsWith('/pending') && !pathname.startsWith('/rejected')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Autenticado → checar status via service role (bypassa RLS)
  if (user && !isPublicRoute) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminClient
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    // Sem perfil ou pendente → bloqueado
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

    // Rota admin → somente admin
    if (isAdminRoute && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
