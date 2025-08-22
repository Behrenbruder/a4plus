// Security utilities for blocking web access to database APIs

export function isDesktopAppRequest(request: Request): boolean {
  // Check for desktop app user agent
  const userAgent = request.headers.get('user-agent') || ''
  
  // Desktop app should send a specific user agent
  if (userAgent.includes('ArteLeadDesktopApp')) {
    return true
  }
  
  // Check for desktop app specific header
  const appHeader = request.headers.get('x-app-type')
  if (appHeader === 'desktop') {
    return true
  }
  
  // Check if request comes from localhost (desktop app)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  if (origin?.includes('localhost') || 
      referer?.includes('localhost') || 
      host?.includes('localhost') ||
      origin?.includes('127.0.0.1') ||
      referer?.includes('127.0.0.1') ||
      host?.includes('127.0.0.1')) {
    return true
  }
  
  // Check for Electron user agent (common for desktop apps)
  if (userAgent.includes('Electron')) {
    return true
  }
  
  // Temporarily allow all requests until desktop app is properly configured
  // TODO: Remove this after desktop app is configured with proper headers
  return true
}

export function createSecurityResponse() {
  return new Response(
    JSON.stringify({
      error: 'Database access disabled for web requests',
      message: 'This API endpoint is only available for the desktop application for security reasons.',
      code: 'WEB_ACCESS_DISABLED'
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Security-Policy': 'desktop-only'
      }
    }
  )
}

export function blockWebDatabaseAccess(request: Request) {
  if (!isDesktopAppRequest(request)) {
    return createSecurityResponse()
  }
  return null // Allow request to continue
}
