import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"

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
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Single call - refreshes session if needed and returns user
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Use getUser() to refresh session and validate auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect authenticated users away from auth pages
    if (user) {
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
