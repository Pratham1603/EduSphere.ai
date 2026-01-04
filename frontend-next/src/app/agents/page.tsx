'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

type AgentConfig = {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'coming-soon'
  model: string
  avgResponseTime: string
  successRate: number
  totalCalls: number
  lastUsed: string
  capabilities: string[]
  settings: {
    temperature: number
    maxTokens: number
    timeout: number
  }
}

const agents: AgentConfig[] = [
  {
    id: 'intent',
    name: 'Intent Agent',
    description: 'Analyzes user prompts to detect intent, extract parameters, and route to appropriate agents.',
    icon: '🎯',
    status: 'active',
    model: 'gemini-2.0-flash',
    avgResponseTime: '0.3s',
    successRate: 98.5,
    totalCalls: 1247,
    lastUsed: '2 minutes ago',
    capabilities: ['Intent Classification', 'Parameter Extraction', 'Topic Detection', 'Language Understanding'],
    settings: { temperature: 0.3, maxTokens: 256, timeout: 10 },
  },
  {
    id: 'content',
    name: 'Content Agent',
    description: 'Extracts key academic topics and concepts from chapter notes using AI analysis.',
    icon: '📚',
    status: 'active',
    model: 'gemini-2.0-flash',
    avgResponseTime: '1.2s',
    successRate: 97.1,
    totalCalls: 634,
    lastUsed: '3 minutes ago',
    capabilities: ['Topic Extraction', 'Content Analysis', 'Key Concepts', 'Summary Generation'],
    settings: { temperature: 0.4, maxTokens: 1024, timeout: 15 },
  },
  {
    id: 'quiz',
    name: 'Quiz Agent',
    description: 'Generates high-quality multiple-choice questions with AI-powered content understanding.',
    icon: '📝',
    status: 'active',
    model: 'gemini-2.0-flash',
    avgResponseTime: '2.1s',
    successRate: 96.2,
    totalCalls: 892,
    lastUsed: '5 minutes ago',
    capabilities: ['Question Generation', 'Answer Validation', 'Difficulty Scaling', 'Subject Detection'],
    settings: { temperature: 0.7, maxTokens: 2048, timeout: 30 },
  },
  {
    id: 'forms',
    name: 'Forms Agent',
    description: 'Creates Google Forms automatically using OAuth integration with the Forms API.',
    icon: '📋',
    status: 'active',
    model: 'Google Forms API',
    avgResponseTime: '1.5s',
    successRate: 94.8,
    totalCalls: 456,
    lastUsed: '10 minutes ago',
    capabilities: ['Form Creation', 'Question Mapping', 'Response Collection', 'OAuth Management'],
    settings: { temperature: 0, maxTokens: 0, timeout: 15 },
  },
  {
    id: 'classroom',
    name: 'Classroom Agent',
    description: 'Posts assignments and materials to Google Classroom for seamless distribution.',
    icon: '🏫',
    status: 'active',
    model: 'Google Classroom API',
    avgResponseTime: '0.8s',
    successRate: 99.2,
    totalCalls: 312,
    lastUsed: '1 minute ago',
    capabilities: ['Assignment Creation', 'Material Posting', 'Student Notifications', 'Grade Sync'],
    settings: { temperature: 0, maxTokens: 0, timeout: 20 },
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Analyzes student performance data and generates insights for educators.',
    icon: '📊',
    status: 'coming-soon',
    model: 'gemini-2.0-flash',
    avgResponseTime: '-',
    successRate: 0,
    totalCalls: 0,
    lastUsed: 'Never',
    capabilities: ['Performance Analysis', 'Trend Detection', 'Report Generation', 'Recommendations'],
    settings: { temperature: 0.5, maxTokens: 4096, timeout: 60 },
  },
  {
    id: 'learning',
    name: 'Learning Agent',
    description: 'Provides personalized learning recommendations based on student progress.',
    icon: '🧠',
    status: 'coming-soon',
    model: 'gemini-2.0-flash',
    avgResponseTime: '-',
    successRate: 0,
    totalCalls: 0,
    lastUsed: 'Never',
    capabilities: ['Personalization', 'Adaptive Learning', 'Content Suggestion', 'Gap Analysis'],
    settings: { temperature: 0.6, maxTokens: 1024, timeout: 30 },
  },
]

function AgentCard({ agent, onSelect }: { agent: AgentConfig; onSelect: () => void }) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    'coming-soon': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-6 transition-all ${
        agent.status === 'coming-soon'
          ? 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-soft hover:shadow-lift'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{agent.model}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[agent.status]}`}>
          {agent.status === 'coming-soon' ? 'Coming Soon' : agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{agent.description}</p>

      {agent.status === 'active' && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{agent.totalCalls}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Calls</div>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-center">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{agent.successRate}%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Success</div>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2 text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{agent.avgResponseTime}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Time</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.capabilities.slice(0, 3).map((cap) => (
          <span
            key={cap}
            className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300"
          >
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-500">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function AgentDetailPanel({ agent, onClose }: { agent: AgentConfig; onClose: () => void }) {
  const [tempSettings, setTempSettings] = useState(agent.settings)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{agent.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{agent.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{agent.model}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{agent.description}</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{agent.totalCalls}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total API Calls</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{agent.successRate}%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Success Rate</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{agent.avgResponseTime}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Avg Response</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{agent.lastUsed}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Last Used</div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Capabilities</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {agent.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Settings */}
      {agent.status === 'active' && agent.settings.maxTokens > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Configuration</h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-600 dark:text-slate-400">Temperature</label>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{tempSettings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={tempSettings.temperature}
                onChange={(e) => setTempSettings({ ...tempSettings, temperature: parseFloat(e.target.value) })}
                className="mt-2 w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-600 dark:text-slate-400">Max Tokens</label>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{tempSettings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="128"
                max="4096"
                step="128"
                value={tempSettings.maxTokens}
                onChange={(e) => setTempSettings({ ...tempSettings, maxTokens: parseInt(e.target.value) })}
                className="mt-2 w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-600 dark:text-slate-400">Timeout (seconds)</label>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{tempSettings.timeout}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={tempSettings.timeout}
                onChange={(e) => setTempSettings({ ...tempSettings, timeout: parseInt(e.target.value) })}
                className="mt-2 w-full accent-indigo-600"
              />
            </div>
          </div>

          <button className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            Save Configuration
          </button>
        </div>
      )}

      {agent.status === 'coming-soon' && (
        <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⏳</span>
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Coming Soon</span>
          </div>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            This agent is currently under development. Stay tuned for updates!
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'coming-soon'>('all')

  const filteredAgents = agents.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const activeCount = agents.filter((a) => a.status === 'active').length
  const comingSoonCount = agents.filter((a) => a.status === 'coming-soon').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Agents</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Manage and configure your multi-agent orchestration system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['all', 'active', 'coming-soon'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'all' ? `All (${agents.length})` : f === 'active' ? `Active (${activeCount})` : `Coming (${comingSoonCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 p-3">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{agents.length}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Agents</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-3">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Active</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
                <span className="text-2xl">📞</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {agents.reduce((sum, a) => sum + a.totalCalls, 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Calls</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-3">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">96.5%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Success</div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Grid + Detail Panel */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`space-y-4 ${selectedAgent ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className={`grid gap-4 ${selectedAgent ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onSelect={() => setSelectedAgent(agent)} />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selectedAgent && (
              <div className="lg:col-span-1">
                <AgentDetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
