'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { PromptCard } from '@/components/PromptCard'
import { AgentTimeline } from '@/components/AgentTimeline'
import { QuizPreview } from '@/components/QuizPreview'
import { FormPreview } from '@/components/FormPreview'
import { ContentPreview } from '@/components/ContentPreview'
import { DeliveryPreview } from '@/components/DeliveryPreview'
import { Confetti } from '@/components/Confetti'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { AgentKey, AgentStatus, OrchestrateResponse, QuizQuestion, HistoryItem, ContentOutput, DeliveryOutput } from '@/lib/types'

type TimelineStep = {
  key: AgentKey
  title: string
  subtitle: string
  status: AgentStatus
  duration?: number
  disabled?: boolean
}

function initialSteps(): TimelineStep[] {
  return [
    {
      key: 'intent',
      title: 'Intent Agent',
      subtitle: 'Analyzing your request...',
      status: 'pending',
    },
    {
      key: 'content',
      title: 'Content Agent',
      subtitle: 'Extracting key academic topics...',
      status: 'pending',
    },
    {
      key: 'quiz',
      title: 'Quiz Agent',
      subtitle: 'Generating questions with AI...',
      status: 'pending',
    },
    {
      key: 'forms',
      title: 'Forms Agent',
      subtitle: 'Creating Google Form...',
      status: 'pending',
    },
    {
      key: 'classroom',
      title: 'Classroom Agent',
      subtitle: 'Assigning to Google Classroom...',
      status: 'pending',
    },
  ]
}

export default function Page() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<TimelineStep[]>(() => initialSteps())
  const [response, setResponse] = useState<OrchestrateResponse | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [contentOutput, setContentOutput] = useState<ContentOutput | null>(null)
  const [deliveryOutput, setDeliveryOutput] = useState<DeliveryOutput | null>(null)
  const [formUrl, setFormUrl] = useState<string | null>(null)
  const [formId, setFormId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isDark, setIsDark] = useState(false)
  const [totalDuration, setTotalDuration] = useState<number | null>(null)

  const canRun = useMemo(() => !!prompt.trim() && !loading, [prompt, loading])

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const updateStep = useCallback((key: AgentKey, updates: Partial<TimelineStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...updates } : s))
    )
  }, [])

  async function runAgents() {
    if (!canRun) return

    setLoading(true)
    setResponse(null)
    setQuestions([])
    setContentOutput(null)
    setDeliveryOutput(null)
    setFormUrl(null)
    setFormId(null)
    setShowConfetti(false)
    setTotalDuration(null)
    setSteps(initialSteps())

    const startTime = Date.now()

    try {
      // Call orchestrator API
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = (await res.json()) as OrchestrateResponse
      setResponse(json)

      // Update all agent steps based on response
      const elapsed = (Date.now() - startTime) / 1000
      const stepDuration = elapsed / 5 // Distribute across 5 agents

      // Intent Agent
      updateStep('intent', { status: 'completed', duration: parseFloat(stepDuration.toFixed(1)), subtitle: 'Request analyzed' })
      await new Promise((r) => setTimeout(r, 100))

      // Content Agent
      if (json.data?.content) {
        setContentOutput(json.data.content)
        updateStep('content', { 
          status: 'completed', 
          duration: parseFloat(stepDuration.toFixed(1)),
          subtitle: `Extracted ${json.data.content.key_topics?.length || 0} key topics`
        })
      } else {
        updateStep('content', { status: 'completed', duration: parseFloat(stepDuration.toFixed(1)) })
      }
      await new Promise((r) => setTimeout(r, 100))

      // Quiz Agent
      if (json.data?.questions) {
        setQuestions(json.data.questions)
        updateStep('quiz', { 
          status: 'completed', 
          duration: parseFloat(stepDuration.toFixed(1)),
          subtitle: `Generated ${json.data.questions.length} questions`
        })
      } else {
        updateStep('quiz', { status: 'completed', duration: parseFloat(stepDuration.toFixed(1)) })
      }
      await new Promise((r) => setTimeout(r, 100))

      // Forms Agent
      if (json.data?.form_url) {
        setFormUrl(json.data.form_url)
        setFormId(json.data.form_id || 'unknown')
        updateStep('forms', { 
          status: 'completed', 
          duration: parseFloat(stepDuration.toFixed(1)),
          subtitle: 'Google Form created'
        })
      } else {
        updateStep('forms', { status: 'completed', duration: parseFloat(stepDuration.toFixed(1)) })
      }
      await new Promise((r) => setTimeout(r, 100))

      // Classroom Agent
      if (json.data?.delivery) {
        setDeliveryOutput(json.data.delivery)
        updateStep('classroom', { 
          status: 'completed', 
          duration: parseFloat(stepDuration.toFixed(1)),
          subtitle: `${json.data.delivery.delivery_status} (${json.data.delivery.mode})`
        })
        // Show confetti for successful assignment
        if (json.data.delivery.delivery_status === 'assigned') {
          setShowConfetti(true)
        }
      } else {
        updateStep('classroom', { status: 'completed', duration: parseFloat(stepDuration.toFixed(1)) })
      }

      const total = ((Date.now() - startTime) / 1000).toFixed(1)
      setTotalDuration(parseFloat(total))

      // Add to history
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          prompt,
          timestamp: new Date(),
          success: json.success,
          formUrl: json.data?.form_url,
          questionCount: json.data?.questions?.length,
        },
        ...prev.slice(0, 9),
      ])
    } catch (err) {
      console.error('Error:', err)
      setResponse({ success: false, message: 'Failed to connect to backend' })
      setSteps(initialSteps())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-slate-900 text-white' : 'bg-slate-50'}`}>
      <Confetti trigger={showConfetti} />

      {/* Theme toggle in corner */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>

      <Navbar />

      <div className="relative">
        <div className={`pointer-events-none absolute inset-0 -z-10 transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900'
            : 'bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50'
        }`} />

        <Hero />

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-14 pt-8 lg:grid-cols-12">
          {/* Left column: Prompt + Results */}
          <div className="space-y-6 lg:col-span-7">
            <PromptCard
              prompt={prompt}
              onPromptChange={setPrompt}
              onRun={runAgents}
              loading={loading}
            />

            {/* Content extraction result */}
            <AnimatePresence>
              {contentOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ContentPreview content={contentOutput} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form result */}
            <AnimatePresence>
              {formUrl && formId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FormPreview formUrl={formUrl} formId={formId} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz preview */}
            <AnimatePresence>
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-3xl border p-6 shadow-soft ${
                    isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                  }`}
                >
                  <QuizPreview questions={questions} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Classroom delivery result */}
            <AnimatePresence>
              {deliveryOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DeliveryPreview delivery={deliveryOutput} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Raw response (collapsible) */}
            {response && (
              <details className={`rounded-3xl border p-6 ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
              }`}>
                <summary className="cursor-pointer text-sm font-semibold">
                  Raw API Response {totalDuration && `(${totalDuration}s)`}
                </summary>
                <pre className={`mt-4 overflow-auto rounded-xl p-4 text-xs ${
                  isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Right column: Timeline + History */}
          <div className="space-y-6 lg:col-span-5">
            <AgentTimeline steps={steps} />

            {/* History sidebar */}
            <div className={`rounded-3xl border p-6 shadow-soft ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Request History</h3>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className={`mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No requests yet. Try creating a quiz!
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-xl border p-3 ${
                        isDark ? 'border-slate-700 bg-slate-700/50' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {item.prompt}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.success
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.success ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                        {item.questionCount && <span>{item.questionCount} questions</span>}
                        {item.formUrl && !item.formUrl.includes('mock') && (
                          <a
                            href={item.formUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Open form
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className={`rounded-3xl border p-6 shadow-soft ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
            }`}>
              <h3 className="text-sm font-semibold">💡 Tips for Better Quizzes</h3>
              <ul className={`mt-3 space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>• Mention topic, chapter, or grade level</li>
                <li>• Specify number of questions (e.g., "10 questions")</li>
                <li>• Request difficulty level (easy, medium, hard)</li>
                <li>• Try: "Create a quiz on photosynthesis for grade 8"</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
