'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/', label: 'Create Quiz' },
  { href: '/agents', label: 'Agents' },
  { href: '/analytics', label: 'Analytics' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-baseline gap-3">
          <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            <span className="text-indigo-600 dark:text-indigo-400">Edu</span>Sphere AI
          </div>
          <div className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
            AI Orchestration for Smart Education
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ y: -1 }}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
