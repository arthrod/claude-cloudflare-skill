/**
 * Cloudflare Worker Examples
 * Created by After Dark Systems, LLC
 *
 * All examples use the modern ES Module Worker format (recommended).
 * Copy and modify these examples for your own workers.
 *
 * To use: Remove the comment block around the example you want to use.
 */

// =============================================================================
// Example 1: Simple Hello World
// =============================================================================
/*
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!', {
      headers: { 'content-type': 'text/plain' },
    })
  }
}
*/

// =============================================================================
// Example 2: URL Redirect Worker
// =============================================================================
/*
const redirectMap = new Map([
  ['/old-page', '/new-page'],
  ['/legacy', 'https://newsite.com/'],
  ['/docs', '/documentation'],
])

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const redirect = redirectMap.get(url.pathname)

    if (redirect) {
      const location = redirect.startsWith('http') ? redirect : url.origin + redirect
      return Response.redirect(location, 301)
    }

    return fetch(request)
  }
}
*/

// =============================================================================
// Example 3: Add Security Headers
// =============================================================================
/*
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)

    newResponse.headers.set('X-Content-Type-Options', 'nosniff')
    newResponse.headers.set('X-Frame-Options', 'DENY')
    newResponse.headers.set('X-XSS-Protection', '1; mode=block')
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    newResponse.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    )

    return newResponse
  }
}
*/

// =============================================================================
// Example 4: API Rate Limiter (with KV)
// =============================================================================
/*
export default {
  async fetch(request, env, ctx) {
    const ip = request.headers.get('CF-Connecting-IP')
    const key = `rate-limit:${ip}`

    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      // Use KV for rate limiting (requires RATE_LIMIT_KV binding in wrangler.toml)
      const count = parseInt(await env.RATE_LIMIT_KV?.get(key) || '0')

      if (count >= 100) {
        return new Response('Too Many Requests', { status: 429 })
      }

      // Increment counter with 60 second expiration
      ctx.waitUntil(env.RATE_LIMIT_KV?.put(key, String(count + 1), { expirationTtl: 60 }))
    }

    return fetch(request)
  }
}
*/

// =============================================================================
// Example 5: A/B Testing
// =============================================================================
/*
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Get or set variant cookie
    const cookie = request.headers.get('Cookie') || ''
    let variant = cookie.match(/ab-variant=([AB])/)?.[1]

    if (!variant) {
      variant = Math.random() < 0.5 ? 'A' : 'B'
    }

    // Modify request based on variant
    if (variant === 'B' && url.pathname === '/') {
      url.pathname = '/variant-b'
    }

    const response = await fetch(url.toString(), request)
    const newResponse = new Response(response.body, response)

    // Set cookie if not present
    if (!cookie.includes('ab-variant=')) {
      newResponse.headers.append('Set-Cookie', `ab-variant=${variant}; path=/; max-age=86400`)
    }

    return newResponse
  }
}
*/

// =============================================================================
// Example 6: Geolocation Redirect
// =============================================================================
/*
export default {
  async fetch(request, env, ctx) {
    const country = request.cf?.country || 'US'

    const countryRedirects = {
      'DE': 'https://de.example.com',
      'FR': 'https://fr.example.com',
      'JP': 'https://jp.example.com',
    }

    if (countryRedirects[country]) {
      return Response.redirect(countryRedirects[country], 302)
    }

    return fetch(request)
  }
}
*/

// =============================================================================
// Example 7: JSON API Worker
// =============================================================================
/*
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return jsonResponse({ status: 'ok', timestamp: Date.now() })
    }

    if (url.pathname === '/api/echo' && request.method === 'POST') {
      const body = await request.json()
      return jsonResponse({ received: body })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  }
}
*/

// =============================================================================
// Example 8: Maintenance Mode
// =============================================================================
/*
const MAINTENANCE_MODE = false
const ALLOWED_IPS = ['192.0.2.1', '192.0.2.2']

const maintenancePage = `
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>We'll be back soon!</h1>
  <p>We're currently performing maintenance. Please check back later.</p>
</body>
</html>
`

export default {
  async fetch(request, env, ctx) {
    if (MAINTENANCE_MODE) {
      const ip = request.headers.get('CF-Connecting-IP')

      if (!ALLOWED_IPS.includes(ip)) {
        return new Response(maintenancePage, {
          status: 503,
          headers: {
            'Content-Type': 'text/html',
            'Retry-After': '3600',
          },
        })
      }
    }

    return fetch(request)
  }
}
*/

// =============================================================================
// Default Export: Active Worker
// =============================================================================
// Uncomment one of the examples above and remove this default export,
// or modify this template for your use case.
export default {
  async fetch(request, env, ctx) {
    return new Response('Hello from Cloudflare Workers!')
  }
}
