'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AgentKey, AgentStatus } from '@/lib/types'

type Step = {
  key: AgentKey
  title: string
  subtitle: string
  status: AgentStatus
  duration?: number
  disabled?: boolean
}

function StatusDot({ status, disabled }: { status: AgentStatus; disabled?: boolean }) {
  if (disabled) {
    return <div className="h-3.5 w-3.5 rounded-full border border-slate-300 bg-slate-100" />
  }

  if (status === 'completed') {
    return (
      <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    )
  }

  if (status === 'running') {
    return (
      <div className="relative">
        <motion.div
          className="absolute -inset-2 rounded-full bg-indigo-400/20"
          animate={{ opacity: [0.25, 0.8, 0.25], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative h-6 w-6 rounded-full bg-indigo-600 shadow" />
      </div>
    )
  }

  return <div className="h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
}

export function AgentTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">Agent execution timeline</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Visualize the multi-agent flow.</div>

      <div className="mt-6 space-y-5">
        <AnimatePresence initial={false}>
          {steps.map((step, idx) => (
            <motion.div
              key={step.key}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-4"
            >
              <div className="mt-0.5 flex flex-col items-center">
                <StatusDot status={step.status} disabled={step.disabled} />
                {idx !== steps.length - 1 && (
                  <div className="mt-3 h-10 w-px bg-slate-200 dark:bg-slate-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {step.title}
                    {step.disabled && <span className="ml-2 text-xs font-medium text-slate-400">(future)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {step.duration && step.status === 'completed' && (
                      <span className="text-xs text-slate-400">{step.duration}s</span>
                    )}
                    <div className={`text-xs font-medium ${
                      step.disabled ? 'text-slate-400' :
                      step.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                      step.status === 'running' ? 'text-indigo-600 dark:text-indigo-400' :
                      'text-slate-500'
                    }`}>
                      {step.disabled ? 'Disabled' : step.status.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.subtitle}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
