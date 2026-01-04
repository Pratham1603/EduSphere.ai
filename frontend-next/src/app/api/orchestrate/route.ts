import { NextResponse } from 'next/server'
import type { OrchestrateRequest, OrchestrateResponse } from '@/lib/types'

export async function POST(req: Request) {
  const body = (await req.json()) as OrchestrateRequest

  const baseUrl = process.env.EDUSPHERE_BACKEND_URL || 'http://127.0.0.1:8000'

  try {
    const upstream = await fetch(`${baseUrl}/orchestrate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      // Avoid Next.js caching for a demo-like request
      cache: 'no-store',
    })

    const data = (await upstream.json()) as OrchestrateResponse
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    // Hackathon-friendly fallback when backend isn't running
    const mock: OrchestrateResponse = {
      success: true,
      message: 'Mock response (backend not reachable). Start FastAPI to get real results.',
      intent: {
        intent_type: 'quiz_creation',
        source: 'manual_text',
        target: 'google_forms',
        num_questions: 10,
        confidence: 0.72,
      },
      data: {
        questions: [
          {
            question: 'What is the primary concept covered in Chapter 5 Physics? (Mock)',
            options: ['Force', 'Energy', 'Momentum', 'Waves'],
            correct_answer: 'Energy',
          },
        ],
      },
    }

    return NextResponse.json(mock, { status: 200 })
  }
}
