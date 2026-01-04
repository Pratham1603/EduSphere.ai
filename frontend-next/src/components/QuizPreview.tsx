'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizQuestion } from '@/lib/types'

export function QuizPreview({ questions }: { questions: QuizQuestion[] }) {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set())
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})

  const toggleReveal = (idx: number) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const selectOption = (qIdx: number, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [qIdx]: option }))
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No questions generated yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Quiz Preview ({questions.length} questions)
        </h3>
        <button
          onClick={() => {
            if (revealedAnswers.size === questions.length) {
              setRevealedAnswers(new Set())
            } else {
              setRevealedAnswers(new Set(questions.map((_, i) => i)))
            }
          }}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {revealedAnswers.size === questions.length ? 'Hide all answers' : 'Reveal all answers'}
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isRevealed = revealedAnswers.has(idx)
          const selected = selectedOptions[idx]
          const isCorrect = selected === q.correct_answer

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{q.question}</p>
                </div>
                <button
                  onClick={() => toggleReveal(idx)}
                  className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  {isRevealed ? 'Hide' : 'Show'} answer
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(q.options || []).map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx)
                  const isAnswer = opt === q.correct_answer
                  const isSelected = selected === opt

                  return (
                    <motion.button
                      key={opt}
                      onClick={() => selectOption(idx, opt)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        isRevealed && isAnswer
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : isSelected
                            ? isRevealed
                              ? isCorrect
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-rose-300 bg-rose-50'
                              : 'border-indigo-300 bg-indigo-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isRevealed && isAnswer
                            ? 'bg-emerald-500 text-white'
                            : isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isRevealed && isAnswer && (
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden rounded-xl bg-emerald-50 px-4 py-2"
                  >
                    <p className="text-xs font-medium text-emerald-700">
                      ✓ Correct answer: {q.correct_answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
