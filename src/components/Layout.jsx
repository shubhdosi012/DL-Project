import { useEffect, useState } from 'react'
import { ArrowUp, Bot, Compass, Heart, LogOut, Mail, MapPin, Menu, Palette, Route, Share2, User, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AuthModal } from './AuthModal'
import { ThemeCustomizer } from './ThemeCustomizer'
import { TravelChat } from './TravelChat'
import { TravelCursor } from './TravelCursor'
import { TravellerBackdrop } from './TravellerBackdrop'

const navigation = [
  ['/', 'Home'],
  ['/explore', 'Explore'],
  ['/planner', 'Plan a Trip'],
  ['/saved', 'My Trips'],
]

export function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const { user, logoutUser, setIsAuthOpen, setIsChatOpen, setIsThemeOpen } = useApp()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(docH > 0 ? Math.min(100, Math.round((y / docH) * 100)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <div className="theme-shell relative min-h-screen overflow-x-hidden">
      <TravellerBackdrop />

      {/* Top Scroll Progress Bar */}
      <div className="pointer-events-none fixed left-0 top-0 z-[70] h-[3px] w-full bg-transparent print:hidden">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${scrollPct}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* ── CLEAN NAVIGATION BAR ── */}
      <header
        className={`sticky top-0 z-50 border-b border-[var(--border-color)] transition-all duration-200 backdrop-blur-lg ${
          scrolled ? 'shadow-sm' : ''
        }`}
        style={{ background: 'var(--bg-header)' }}
      >
        <div className="page-shell flex h-[74px] items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173D32] text-[#FAF9F5] shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Compass size={20} className="text-[#D99B63]" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Bharat<span style={{ color: 'var(--accent)' }}>Yatra</span> AI
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="nav-link inline-flex items-center gap-1.5"
            >
              <Bot size={15} style={{ color: 'var(--accent)' }} /> AI Assistant
            </button>
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              type="button"
              onClick={() => setIsThemeOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition hover:border-[var(--accent)]"
              title="Customize Theme"
              aria-label="Customize Theme"
            >
              <Palette size={17} />
            </button>

            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#173D32] text-xs font-bold text-white">
                  {user.name[0]?.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{user.name}</span>
                <button
                  onClick={logoutUser}
                  className="ml-1 text-[var(--text-muted)] hover:text-rose-600"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="btn-primary !px-4 !py-2.5 text-xs"
              >
                <User size={15} /> Login / Sign Up
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsChatOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              aria-label="Open AI Assistant"
            >
              <Bot size={18} />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              onClick={() => setOpen(!open)}
              aria-label="Open navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div
            className="border-t border-[var(--border-color)] px-5 py-4 lg:hidden"
            style={{ background: 'var(--bg-base)' }}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
                >
                  {to === '/saved' ? <Heart size={16} /> : to === '/planner' ? <Route size={16} /> : null}
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setOpen(false); setIsChatOpen(true) }}
                className="mobile-nav-link text-left"
              >
                <Bot size={16} /> AI Assistant
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setIsThemeOpen(true) }}
                className="mobile-nav-link text-left"
              >
                <Palette size={16} /> Theme Studio
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => { logoutUser(); setOpen(false) }}
                  className="mt-2 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-3 text-sm font-semibold text-[var(--text-primary)]"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setOpen(false); setIsAuthOpen(true) }}
                  className="btn-primary mt-2 w-full"
                >
                  <User size={16} /> Login / Sign Up
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main key={pathname} className="relative z-10 page-enter">
        {children}
      </main>

      {/* ── PROFESSIONAL FOOTER ── */}
      <footer className="relative z-10 mt-20 border-t border-[#235446] bg-[#173D32] py-14 text-[#E9E3D5]">
        <div className="page-shell grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FAF9F5]/10 text-[#D99B63]">
                <Compass size={19} />
              </span>
              <span className="font-display text-xl font-bold text-[#FAF9F5]">
                Bharat<span className="text-[#D99B63]">Yatra</span> AI
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#B7C9A8]">
              About Us: BharatYatra AI helps travellers discover inspiring destinations, estimate realistic budgets, and build day-by-day itineraries with ease.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { label: 'Instagram', icon: <Share2 size={15} /> },
                { label: 'Twitter', icon: <Compass size={15} /> },
                { label: 'YouTube', icon: <Route size={15} /> },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#top"
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  aria-label={social.label}
                  title={social.label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#FAF9F5] transition hover:border-[#D99B63] hover:text-[#D99B63]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="footer-label">QUICK LINKS</p>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/explore" className="footer-link">Explore Destinations</Link>
            <Link to="/planner" className="footer-link">Plan a Trip</Link>
            <Link to="/saved" className="footer-link">My Trips</Link>
          </div>

          <div>
            <p className="footer-label">FEATURES</p>
            <button onClick={() => setIsChatOpen(true)} className="footer-link text-left">AI Travel Assistant</button>
            <Link to="/planner" className="footer-link">Budget Calculator</Link>
            <Link to="/explore" className="footer-link">Weather Rankings</Link>
            <button onClick={() => setIsThemeOpen(true)} className="footer-link text-left">Theme Studio</button>
          </div>

          <div>
            <p className="footer-label">CONTACT US</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#E9E3D5]">
              <Mail size={15} className="text-[#D99B63]" /> hello@bharatyatra.ai
            </p>
            <p className="mt-2.5 flex items-center gap-2 text-sm text-[#B7C9A8]">
              <MapPin size={15} className="text-[#D99B63]" /> New Delhi & Bengaluru, India
            </p>
          </div>
        </div>

        <div className="page-shell mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#B7C9A8] sm:flex-row">
          <p>© {new Date().getFullYear()} BharatYatra AI. All rights reserved.</p>
          <p>Forest Green & Warm Beige Travel Edition</p>
        </div>
      </footer>

      {scrollPct > 18 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="back-to-top print:hidden"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <AuthModal />
      <ThemeCustomizer />
      <TravelChat />
      <TravelCursor />
    </div>
  )
}
