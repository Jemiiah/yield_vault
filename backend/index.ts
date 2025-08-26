import { Hono } from 'hono'

const app = new Hono()

app.get('/pools', async (c) => {
  const sourceRoute = Bun.env.SOURCE_ROUTE
  const headersJson = Bun.env.HEADERS_JSON

  if (!sourceRoute || !headersJson) {
    return c.json({ error: 'misconfigured' }, 400)
  }

  let headersObj: unknown
  try {
    headersObj = JSON.parse(headersJson)
  } catch {
    return c.json({ error: 'misconfigured' }, 400)
  }
  if (
    typeof headersObj !== 'object' ||
    headersObj === null ||
    Array.isArray(headersObj)
  ) {
    return c.json({ error: 'misconfigured' }, 400)
  }

  const headers = new Headers()
  for (const [k, v] of Object.entries(headersObj as Record<string, unknown>)) {
    if (typeof v === 'string') headers.set(k, v)
  }

  const incomingUrl = new URL(c.req.url)
  const upstreamUrl = new URL(sourceRoute)
  upstreamUrl.search = incomingUrl.search

  const resp = await fetch(upstreamUrl.toString(), {
    method: 'GET',
    headers,
  })

  const contentType =
    resp.headers.get('content-type') ?? 'application/octet-stream'

  return new Response(resp.body, {
    status: resp.status,
    headers: { 'content-type': contentType },
  })
})

const port = Number(Bun.env.PORT || 3000)
Bun.serve({ port, fetch: app.fetch })
console.log(`listening on http://localhost:${port}`)