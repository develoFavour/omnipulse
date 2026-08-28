import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/connections(.*)',
  '/broadcast(.*)',
  '/audience(.*)',
  '/activity(.*)',
  '/onboarding(.*)',
])

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isPublicLandingRoute = createRouteMatcher(['/', '/get-started(.*)'])

const safeInternalRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null
  }
  return value
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Authenticated users should never see sign-in/sign-up again. If an OAuth
  // callback was preserved through sign-in, return to it instead of dashboard.
  if (userId && isAuthRoute(req)) {
    const redirectUrl = safeInternalRedirect(req.nextUrl.searchParams.get('redirect_url'))
    return NextResponse.redirect(new URL(redirectUrl || '/dashboard', req.url))
  }

  if (userId && isPublicLandingRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}
