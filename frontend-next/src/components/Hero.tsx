'use client'

import { motion } from 'framer-motion'

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-6 pt-12"
    >
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
          <motion.span 
            className="h-2 w-2 rounded-full bg-indigo-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Google-style multi-agent demo
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
          One Prompt. <span className="text-indigo-600 dark:text-indigo-400">Multiple AI Agents.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
          Automate quizzes and classroom workflows using AI orchestration powered by Gemini.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Intent Detection</div>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Route prompts to the right agent.</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Quiz Generation</div>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">High-quality questions, ready to review.</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl border border-indigo-200 dark:border-indigo-600/50 bg-indigo-50 dark:bg-indigo-900/20 p-4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Google Forms</div>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create forms automatically with OAuth.</div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
