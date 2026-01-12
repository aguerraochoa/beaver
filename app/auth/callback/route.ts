import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('Cookies available:', allCookies.map(c => c.name))
    
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'auth_failed')
      loginUrl.searchParams.set('details', error.message)
      return NextResponse.redirect(loginUrl)
    }

    console.log('Session exchanged successfully, user:', data.user?.email)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('Session created but no user found')
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'session_failed')
      return NextResponse.redirect(loginUrl)
    }

    if (!user.email_confirmed_at && user.app_metadata?.provider === 'email') {
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'email_not_verified')
      loginUrl.searchParams.set('details', 'Please verify your email before signing in. Check your inbox for the verification link.')
      return NextResponse.redirect(loginUrl)
    }

    const userCreatedRecently = user.created_at && 
      (Date.now() - new Date(user.created_at).getTime()) < 300000
    
    if (userCreatedRecently && user.email_confirmed_at && user.app_metadata?.provider === 'email') {
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('verified', 'true')
      return NextResponse.redirect(loginUrl)
    }
    
    const redirectUrl = new URL(next, requestUrl.origin)
    redirectUrl.searchParams.set('auth', 'success')
    const response = NextResponse.redirect(redirectUrl)
    
    return response
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

