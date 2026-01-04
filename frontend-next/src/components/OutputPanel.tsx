'use client'

import { motion } from 'framer-motion'
import type { OrchestrateResponse, QuizQuestion } from '@/lib/types'
import { prettyJson } from '@/lib/format'

function CodeBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-200">{title}</div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <div className="h-2 w-2 rounded-full bg-amber-300" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      </div>
      <div className="mt-3 overflow-auto rounded-xl bg-slate-900/60 p-3 font-mono text-xs leading-5 text-slate-100">
        {children}
      </div>
    </div>
  )
}

export function OutputPanel({ response }: { response: OrchestrateResponse | null }) {
  if (!response) return null

  const intent = response.intent
  const questions: QuizQuestion[] | undefined = response?.data?.questions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <div className="text-sm font-semibold text-slate-900">Output</div>
      <div className="mt-1 text-sm text-slate-600">Parsed intent and quiz preview.</div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeBox title="Parsed intent">
          <pre>{prettyJson(intent ?? { note: 'No intent returned' })}</pre>
        </CodeBox>

        <CodeBox title="Raw response">
          <pre>{prettyJson(response)}</pre>
        </CodeBox>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold text-slate-700">Quiz preview</div>
        <div className="mt-3 space-y-3">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.slice(0, 6).map((q, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-900">
                  {idx + 1}. {q.question}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(q.options ?? []).map((opt) => (
                    <div
                      key={opt}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No quiz questions in response yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
