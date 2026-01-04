'use client'

import { motion } from 'framer-motion'
import type { ContentOutput } from '@/lib/types'

type Props = {
  content: ContentOutput
}

export function ContentPreview({ content }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="text-xl">📚</span>
        <h3 className="font-semibold text-slate-900 dark:text-white">Extracted Key Topics</h3>
      </div>
      
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {content.summary}
      </p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {content.key_topics.map((topic, idx) => (
          <motion.span
            key={topic}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {topic}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
