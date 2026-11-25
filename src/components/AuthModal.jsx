import { Lock, Mail, Sparkles, User, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, loginUser } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isAuthOpen) return null

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 4) {
      setError('Please enter a password (at least 4 characters).')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.')
      return
    }
    setError('')
    loginUser({ name: name.trim(), email: email.trim() })
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setIsAuthOpen(false)}>
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-base)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Login or Sign Up"
      >
        <div className="flex items-center justify-between bg-[#173D32] px-6 py-5 text-[#FAF9F5]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D99B63]">BharatYatra AI Account</p>
            <h2 className="mt-1 font-display text-xl font-bold">
              {mode === 'login' ? 'Welcome back, traveller' : 'Create your travel profile'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#E9E3D5] p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className={`rounded-xl py-2 text-xs font-bold transition ${mode === 'login' ? 'bg-[#173D32] text-white shadow-sm' : 'text-[#173D32]'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`rounded-xl py-2 text-xs font-bold transition ${mode === 'signup' ? 'bg-[#173D32] text-white shadow-sm' : 'text-[#173D32]'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Full Name</span>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" className="input !pl-10" />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Email Address</span>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input !pl-10" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[var(--text-primary)]">Password</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input !pl-10" />
              </div>
            </label>

            {error && <p className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => loginUser({ name: 'Explorer Demo', email: 'demo@bharatyatra.ai' })}
            className="btn-outline mt-3 w-full !py-2.5 text-xs"
          >
            <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Continue as Demo Traveller
          </button>
          <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
            Demo authentication stored locally on your browser.
          </p>
        </div>
      </div>
    </div>
  )
}
