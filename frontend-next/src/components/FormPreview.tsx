'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function FormPreview({ formUrl, formId }: { formUrl: string; formId: string }) {
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const isMock = formId === 'mock_form_id'

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isMock) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Google Forms not authorized</h4>
            <p className="mt-1 text-sm text-amber-700">
              Visit <a href="http://127.0.0.1:8000/auth/google" target="_blank" className="underline font-medium">http://127.0.0.1:8000/auth/google</a> to connect your Google account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">Google Form Created!</h4>
            <p className="text-xs text-emerald-700 truncate max-w-xs">{formUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </motion.button>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Form
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
        >
          {showEmbed ? '▼ Hide preview' : '▶ Show preview'}
        </button>
      </div>

      {showEmbed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-white"
        >
          <iframe
            src={formUrl.replace('/viewform', '/viewform?embedded=true')}
            width="100%"
            height="500"
            className="border-0"
          >
            Loading form...
          </iframe>
        </motion.div>
      )}
    </motion.div>
  )
}
