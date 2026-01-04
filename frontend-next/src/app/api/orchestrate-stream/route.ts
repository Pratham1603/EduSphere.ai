import type { OrchestrateRequest } from '@/lib/types'

export async function POST(req: Request) {
  const body = (await req.json()) as OrchestrateRequest
  const baseUrl = process.env.EDUSPHERE_BACKEND_URL || 'http://127.0.0.1:8000'

  try {
    const upstream = await fetch(`${baseUrl}/orchestrate/stream`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Forward the SSE stream
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch {
    return new Response(
      `event: error\ndata: {"message": "Backend not reachable"}\n\n`,
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    )
  }
}
