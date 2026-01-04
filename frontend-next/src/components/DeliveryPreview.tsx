'use client'

import { motion } from 'framer-motion'
import type { DeliveryOutput } from '@/lib/types'

type Props = {
  delivery: DeliveryOutput
}

export function DeliveryPreview({ delivery }: Props) {
  const isDemo = delivery.mode === 'demo'
  
  return (
    <div className={`rounded-2xl border p-5 shadow-soft ${
      isDemo 
        ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' 
        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏫</span>
          <h3 className="font-semibold text-slate-900 dark:text-white">Classroom Assignment</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          isDemo 
            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
        }`}>
          {isDemo ? 'Demo Mode' : 'Live'}
        </span>
      </div>
      
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {delivery.message}
      </p>
      
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">Status</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            {delivery.delivery_status.charAt(0).toUpperCase() + delivery.delivery_status.slice(1)}
          </div>
        </div>
        <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">Platform</div>
          <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
            {delivery.platform}
          </div>
        </div>
      </div>
      
      {delivery.classroom_url && (
        <a
          href={delivery.classroom_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>View in Classroom</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {isDemo && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          ⚠️ This is a simulated assignment. Connect Google Classroom for live integration.
        </p>
      )}
    </div>
  )
}
