'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

type AuthStatus = {
  authenticated: boolean
  email?: string
  scopes?: string[]
}

export default function SettingsPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  async function checkAuthStatus() {
    try {
      const res = await fetch('http://localhost:8000/auth/status')
      const data = await res.json()
      setAuthStatus(data)
    } catch {
      setAuthStatus({ authenticated: false })
    } finally {
      setLoading(false)
    }
  }

  async function connectGoogle() {
    setConnecting(true)
    try {
      const res = await fetch('http://localhost:8000/auth/google')
      const data = await res.json()
      if (data.auth_url) {
        window.open(data.auth_url, '_blank', 'width=600,height=700')
        // Poll for auth status
        const pollInterval = setInterval(async () => {
          await checkAuthStatus()
          if (authStatus?.authenticated) {
            clearInterval(pollInterval)
          }
        }, 2000)
        setTimeout(() => clearInterval(pollInterval), 60000) // Stop after 1 min
      }
    } catch (err) {
      console.error('Failed to start OAuth:', err)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Configure your EduSphere AI integrations</p>

        {/* Google Integration */}
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Google Integration</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Connect your Google account to create Forms and access Classroom
              </p>

              {loading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                  Checking authentication status...
                </div>
              ) : authStatus?.authenticated ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
                    {authStatus.email && (
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">({authStatus.email})</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={checkAuthStatus}
                      className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Refresh Status
                    </button>
                    <button
                      className="rounded-lg border border-rose-200 dark:border-rose-800 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Not Connected</span>
                    </div>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Connect your Google account to create real Google Forms instead of mock forms.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={connectGoogle}
                    disabled={connecting}
                    className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-60"
                  >
                    {connecting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Connect with Google
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Configuration</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Configure backend API settings</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Backend URL</label>
              <input
                type="text"
                value="http://localhost:8000"
                readOnly
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gemini Model</label>
              <input
                type="text"
                value="gemini-2.0-flash"
                readOnly
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">About EduSphere AI</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            EduSphere AI is a multi-agent orchestration system for smart education. It uses AI-powered agents
            to automate quiz generation, Google Forms creation, and classroom management.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Version:</span>
              <span className="ml-1 font-medium text-slate-700 dark:text-slate-300">1.0.0</span>
            </div>
            <div className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Framework:</span>
              <span className="ml-1 font-medium text-slate-700 dark:text-slate-300">Next.js 15 + FastAPI</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
