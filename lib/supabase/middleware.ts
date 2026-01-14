import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Allow login, auth, and public routes without checking auth
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    // Allow the request to continue - the page will handle the error
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              const sameSite = options?.sameSite === false 
                ? undefined 
                : (options?.sameSite as 'strict' | 'lax' | 'none' | undefined)
              supabaseResponse.cookies.set(name, value, {
                ...options,
                sameSite,
              })
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // no user, redirect to login page WITH the original URL preserved
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Error in middleware:', error)
    // On error (e.g. invalid refresh token), redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }
}

