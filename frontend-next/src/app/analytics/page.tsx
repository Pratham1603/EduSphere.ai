'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

// Generate mock data for charts
function generateDailyData(days: number) {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quizzes: Math.floor(Math.random() * 30) + 10,
      questions: Math.floor(Math.random() * 150) + 50,
      forms: Math.floor(Math.random() * 20) + 5,
      successRate: Math.floor(Math.random() * 10) + 90,
    })
  }
  return data
}

function generateHourlyData() {
  const data = []
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      requests: Math.floor(Math.random() * 50) + 5,
    })
  }
  return data
}

const subjectStats = [
  { name: 'Physics', quizzes: 145, questions: 725, color: 'bg-blue-500' },
  { name: 'Chemistry', quizzes: 123, questions: 615, color: 'bg-purple-500' },
  { name: 'Biology', quizzes: 98, questions: 490, color: 'bg-green-500' },
  { name: 'Mathematics', quizzes: 87, questions: 435, color: 'bg-amber-500' },
  { name: 'History', quizzes: 65, questions: 325, color: 'bg-rose-500' },
  { name: 'Geography', quizzes: 54, questions: 270, color: 'bg-cyan-500' },
]

const recentActivity = [
  { id: 1, type: 'quiz', subject: 'Physics', topic: 'Electromagnetic Waves', questions: 10, time: '5 min ago', success: true },
  { id: 2, type: 'form', subject: 'Chemistry', topic: 'Periodic Table', questions: 15, time: '12 min ago', success: true },
  { id: 3, type: 'quiz', subject: 'Biology', topic: 'Cell Division', questions: 8, time: '25 min ago', success: true },
  { id: 4, type: 'quiz', subject: 'Mathematics', topic: 'Calculus', questions: 12, time: '1 hour ago', success: false },
  { id: 5, type: 'form', subject: 'History', topic: 'World War II', questions: 20, time: '2 hours ago', success: true },
]

function SimpleBarChart({ data, dataKey, color }: { data: { [key: string]: any }[]; dataKey: string; color: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]))
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item[dataKey] / max) * 100}%` }}
            transition={{ duration: 0.5, delay: idx * 0.02 }}
            className={`w-full rounded-t ${color} min-h-[4px]`}
          />
          {idx % 4 === 0 && (
            <span className="text-[10px] text-slate-400 truncate w-full text-center">{item.date || item.hour}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function CircularProgress({ value, size = 120, strokeWidth = 8, color = 'stroke-indigo-500' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}%</span>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, changeType, icon }: { title: string; value: string; change: string; changeType: 'up' | 'down' | 'neutral'; icon: string }) {
  const changeColors = {
    up: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    down: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${changeColors[changeType]}`}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'} {change}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{title}</div>
      </div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  
  const dailyData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    return generateDailyData(days)
  }, [timeRange])
  
  const hourlyData = useMemo(() => generateHourlyData(), [])

  const totalQuizzes = dailyData.reduce((sum, d) => sum + d.quizzes, 0)
  const totalQuestions = dailyData.reduce((sum, d) => sum + d.questions, 0)
  const totalForms = dailyData.reduce((sum, d) => sum + d.forms, 0)
  const avgSuccess = Math.round(dailyData.reduce((sum, d) => sum + d.successRate, 0) / dailyData.length)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Track your quiz generation and agent performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="📝" title="Quizzes Created" value={totalQuizzes.toLocaleString()} change="12%" changeType="up" />
          <StatCard icon="❓" title="Questions Generated" value={totalQuestions.toLocaleString()} change="8%" changeType="up" />
          <StatCard icon="📋" title="Forms Published" value={totalForms.toLocaleString()} change="3%" changeType="neutral" />
          <StatCard icon="✅" title="Success Rate" value={`${avgSuccess}%`} change="2%" changeType="up" />
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quiz Generation Trend */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Quiz Generation Trend</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Quizzes created over time</p>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalQuizzes}</div>
            </div>
            <div className="mt-6">
              <SimpleBarChart data={dailyData} dataKey="quizzes" color="bg-indigo-500" />
            </div>
          </div>

          {/* Questions Generated */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Questions Generated</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-generated questions over time</p>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalQuestions}</div>
            </div>
            <div className="mt-6">
              <SimpleBarChart data={dailyData} dataKey="questions" color="bg-purple-500" />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Success Rate */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Agent Success Rate</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Overall agent performance</p>
            <div className="mt-6 flex items-center justify-center">
              <CircularProgress value={avgSuccess} color="stroke-emerald-500" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">98%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Intent</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">96%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Quiz</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">95%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Forms</div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Subject Breakdown</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quizzes by subject area</p>
            <div className="mt-4 space-y-3">
              {subjectStats.map((subject) => {
                const maxQuizzes = Math.max(...subjectStats.map((s) => s.quizzes))
                const percentage = (subject.quizzes / maxQuizzes) * 100
                return (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{subject.name}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{subject.quizzes}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full rounded-full ${subject.color}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hourly Activity */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Hourly Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Request distribution today</p>
            <div className="mt-4">
              <SimpleBarChart data={hourlyData} dataKey="requests" color="bg-cyan-500" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Peak Hour:</span>
                <span className="ml-1 font-medium text-slate-900 dark:text-white">14:00</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total:</span>
                <span className="ml-1 font-medium text-slate-900 dark:text-white">
                  {hourlyData.reduce((sum, d) => sum + d.requests, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest quiz generations and form creations</p>
            </div>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Type</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Subject</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Topic</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Questions</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                  <th className="pb-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        activity.type === 'quiz' 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}>
                        {activity.type === 'quiz' ? '📝' : '📋'}
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-900 dark:text-white">{activity.subject}</td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{activity.topic}</td>
                    <td className="py-3 text-sm text-slate-900 dark:text-white">{activity.questions}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        activity.success
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        {activity.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
