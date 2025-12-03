import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth", "/privacy-policy", "/terms-of-service"]

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Fast path: Skip auth check entirely for public routes (but still check if authenticated users should be redirected)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) || pathname === "/"
  
  if (!isPublicRoute) {
    // For protected routes, we need to check auth
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Fast path: Check session first (doesn't refresh, faster)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Only call getUser() if we have a session (to refresh it)
    // This avoids unnecessary API calls for unauthenticated requests
    let user = session?.user || null
    if (session) {
      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser()
      user = refreshedUser
    }

    // Redirect unauthenticated users to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // For public routes, still check if authenticated users should be redirected away from auth pages
  if (pathname.startsWith("/auth")) {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Redirect authenticated users away from auth pages
    if (session?.user) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  return NextResponse.next({
    request,
  })
}
