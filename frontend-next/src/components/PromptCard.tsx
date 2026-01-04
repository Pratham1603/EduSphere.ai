'use client'

import { motion } from 'framer-motion'

export function PromptCard({
  prompt,
  onPromptChange,
  onRun,
  loading,
}: {
  prompt: string
  onPromptChange: (v: string) => void
  onRun: () => void
  loading: boolean
}) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">Prompt</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Give a single teacher instruction — the agents handle the rest.
      </div>

      <div className="mt-5">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Create a quiz on Chapter 5 Physics with 10 important questions"
          className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm leading-6 text-slate-900 dark:text-white outline-none ring-indigo-500/20 placeholder:text-slate-400 focus:ring-4"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tip: mention question count, topic, grade level.
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRun}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-medium text-white shadow transition-colors disabled:opacity-60"
          >
            {loading ? (
              <motion.span
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                />
                Running…
              </motion.span>
            ) : (
              'Run AI Agents'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
