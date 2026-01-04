'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

type QuickAction = {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  { id: 'create', title: 'Create Quiz', description: 'Generate a new quiz with AI', icon: '✨', href: '/', color: 'bg-indigo-500' },
  { id: 'agents', title: 'Manage Agents', description: 'Configure your AI agents', icon: '🤖', href: '/agents', color: 'bg-purple-500' },
  { id: 'analytics', title: 'View Analytics', description: 'Track performance metrics', icon: '📊', href: '/analytics', color: 'bg-cyan-500' },
  { id: 'forms', title: 'Google Forms', description: 'Connect your Google account', icon: '📋', href: '/settings', color: 'bg-emerald-500' },
]

type RecentQuiz = {
  id: string
  title: string
  subject: string
  questions: number
  createdAt: Date
  formUrl?: string
}

function generateRecentQuizzes(): RecentQuiz[] {
  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History']
  const topics = ['Quantum Mechanics', 'Organic Chemistry', 'Cell Biology', 'Calculus', 'World War II']
  const quizzes: RecentQuiz[] = []
  
  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setHours(date.getHours() - i * 2 - Math.random() * 2)
    quizzes.push({
      id: `quiz-${i}`,
      title: `${topics[i]} Quiz`,
      subject: subjects[i],
      questions: Math.floor(Math.random() * 10) + 5,
      createdAt: date,
      formUrl: i % 2 === 0 ? `https://docs.google.com/forms/d/${i}` : undefined,
    })
  }
  return quizzes
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  )
}

function SystemStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/', { method: 'GET' })
        setStatus(res.ok ? 'online' : 'offline')
      } catch {
        setStatus('offline')
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const statusConfig = {
    checking: { color: 'bg-amber-500', text: 'Checking...', pulse: true },
    online: { color: 'bg-emerald-500', text: 'All Systems Online', pulse: false },
    offline: { color: 'bg-rose-500', text: 'Backend Offline', pulse: true },
  }
  
  const config = statusConfig[status]
  
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
      <div className="relative">
        <div className={`h-3 w-3 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute inset-0 h-3 w-3 animate-ping rounded-full ${config.color} opacity-75`} />
        )}
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{config.text}</span>
    </div>
  )
}

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Link href={action.href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-shadow hover:shadow-lift"
      >
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-2xl text-white shadow-lg`}>
          {action.icon}
        </div>
        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {action.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
      </motion.div>
    </Link>
  )
}

function TodayStats() {
  const stats = [
    { label: 'Quizzes Today', value: '12', icon: '📝', trend: '+3' },
    { label: 'Questions Generated', value: '67', icon: '❓', trend: '+15' },
    { label: 'Forms Created', value: '8', icon: '📋', trend: '+2' },
    { label: 'Success Rate', value: '96%', icon: '✅', trend: '↑' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">{stat.icon}</span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {stat.trend}
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

function RecentQuizzes() {
  const [quizzes] = useState(() => generateRecentQuizzes())

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Quizzes</h3>
        <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          View All
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {quizzes.map((quiz, idx) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                📝
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{quiz.title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {quiz.subject} • {quiz.questions} questions
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {quiz.formUrl && (
                <a
                  href={quiz.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                >
                  View Form
                </a>
              )}
              <span className="text-xs text-slate-400">
                {quiz.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AgentStatusPanel() {
  const agents = [
    { name: 'Intent Agent', status: 'active', lastPing: '< 1s' },
    { name: 'Quiz Agent', status: 'active', lastPing: '2s' },
    { name: 'Forms Agent', status: 'active', lastPing: '5s' },
    { name: 'Classroom Agent', status: 'inactive', lastPing: '-' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Agent Status</h3>
        <Link href="/agents" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          Manage
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${
                agent.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{agent.name}</span>
            </div>
            <span className={`text-xs ${
              agent.status === 'active' 
                ? 'text-slate-500 dark:text-slate-400' 
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {agent.lastPing}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickPrompts() {
  const prompts = [
    'Create a 10-question physics quiz on Newton\'s Laws',
    'Generate a chemistry test about periodic table',
    'Make a biology quiz on human anatomy',
    'Create math practice problems on algebra',
  ]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white">Quick Prompts</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click to copy and use</p>

      <div className="mt-4 space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => navigator.clipboard.writeText(prompt)}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-900 dark:text-white"
            >
              {greeting} 👋
            </motion.h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Welcome back to EduSphere AI. Here's what's happening today.
            </p>
            <div className="mt-4">
              <SystemStatus />
            </div>
          </div>
          <LiveClock />
        </div>

        {/* Today's Stats */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Today's Overview</h2>
          <TodayStats />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentQuizzes />
          </div>
          <div className="space-y-6">
            <AgentStatusPanel />
            <QuickPrompts />
          </div>
        </div>
      </main>
    </div>
  )
}
