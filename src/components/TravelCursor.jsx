import { Heart, MapPin, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TRAIL_COUNT = 8

/**
 * Expressive travel-themed custom cursor for BharatYatra AI.
 * - Inner saffron (#f4772d) compass diamond follows immediately.
 * - Outer navy (#071c3c) compass ring with N/E/S/W ticks & dotted map-route trail lag smoothly.
 * - Reacts to pointer velocity (rotates compass ring & stretches dotted trail).
 * - Interactive states: Paper-plane on CTAs/buttons, MapPin + "Explore" on destination cards/images,
 *   Passport-stamp ring on nav links, Sparkle/Chat bubble on chatbot controls, Heart pulse on favorite buttons.
 * - Click emits an expanding compass-ring ripple + 4 tiny sparkle particles.
 * - Disabled on touch devices and respects prefers-reduced-motion.
 */
export function TravelCursor() {
  const innerRef = useRef(null)
  const ringRef = useRef(null)
  const ringRotRef = useRef(null)
  const trailRefs = useRef([])

  const [enabled, setEnabled] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('default') // 'default' | 'cta' | 'card' | 'nav' | 'chat' | 'favorite'
  const [bursts, setBursts] = useState([])

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionPref = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches) return

    setReducedMotion(motionPref.matches)
    setEnabled(true)
    document.documentElement.classList.add('has-travel-cursor')

    const mouse = { x: -120, y: -120, px: -120, py: -120 }
    const outer = { x: -120, y: -120, angle: 0 }
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: -120, y: -120 }))
    let rafId = 0

    const detectMode = (target) => {
      if (!target || typeof target.closest !== 'function') return 'default'
      const btn = target.closest('button')
      if (
        target.closest('[title*="favourite" i], [title*="favorite" i], [data-cursor="favorite"]') ||
        (btn && btn.querySelector('.lucide-heart'))
      ) {
        return 'favorite'
      }
      if (target.closest('.travel-chat button, .travel-chat a, .chat-launcher')) {
        return 'chat'
      }
      if (target.closest('.nav-link, .mobile-nav-link, header nav a, footer a')) {
        return 'nav'
      }
      if (target.closest('.destination-card, .card-image')) {
        return 'card'
      }
      if (target.closest('button, a, [role="button"], .btn-primary, .btn-secondary, .btn-accent, .btn-outline, .btn-white')) {
        return 'cta'
      }
      return 'default'
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      setVisible(true)
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`
      }
      setMode(detectMode(e.target))
    }

    const onMouseDown = (e) => {
      if (motionPref.matches) return
      const id = `${Date.now()}-${Math.random()}`
      const particles = [
        { dx: -18, dy: -16 },
        { dx: 19, dy: -14 },
        { dx: -16, dy: 18 },
        { dx: 18, dy: 16 },
      ]
      setBursts((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY, particles }])
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id))
      }, 560)
    }

    const onMouseLeave = () => setVisible(false)
    const onTouchStart = () => {
      setEnabled(false)
      setVisible(false)
      document.documentElement.classList.remove('has-travel-cursor')
    }

    const tick = () => {
      const vx = mouse.x - mouse.px
      const vy = mouse.y - mouse.py
      mouse.px = mouse.x
      mouse.py = mouse.y
      const speed = Math.hypot(vx, vy)

      if (motionPref.matches) {
        outer.x = mouse.x
        outer.y = mouse.y
      } else {
        outer.x += (mouse.x - outer.x) * 0.16
        outer.y += (mouse.y - outer.y) * 0.16
        // Gentle compass ring rotation proportional to pointer velocity
        if (speed > 0.4) {
          outer.angle = (outer.angle + Math.min(speed * 0.45, 9)) % 360
        }
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${outer.x}px, ${outer.y}px, 0) translate(-50%, -50%)`
      }
      if (ringRotRef.current && !motionPref.matches) {
        ringRotRef.current.style.transform = `rotate(${outer.angle.toFixed(1)}deg)`
      }

      // Dotted route trail with velocity-responsive spacing
      if (!motionPref.matches) {
        const stretch = Math.min(1.45, 1 + speed * 0.012)
        let prevX = outer.x
        let prevY = outer.y
        for (let i = 0; i < TRAIL_COUNT; i += 1) {
          const pt = trail[i]
          const ease = Math.max(0.14, (0.34 - i * 0.025) / stretch)
          pt.x += (prevX - pt.x) * ease
          pt.y += (prevY - pt.y) * ease
          prevX = pt.x
          prevY = pt.y
          const el = trailRefs.current[i]
          if (el) {
            const dist = Math.hypot(mouse.x - pt.x, mouse.y - pt.y)
            const op = dist > 6 ? Math.max(0.08, (1 - i / TRAIL_COUNT) * 0.72) : 0
            const scale = Math.max(0.45, 1 - i * 0.08)
            el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%) scale(${scale})`
            el.style.opacity = String(op)
          }
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('has-travel-cursor')
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className={`tc-layer print:hidden ${visible ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
      {/* Dotted travel route trail */}
      {!reducedMotion &&
        Array.from({ length: TRAIL_COUNT }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el
            }}
            className="tc-trail-dot"
          />
        ))}

      {/* Click compass-ring ripple + sparkle particles */}
      {!reducedMotion &&
        bursts.map((b) => (
          <div key={b.id} className="tc-burst" style={{ left: `${b.x}px`, top: `${b.y}px` }}>
            <span className="tc-ripple" />
            {b.particles.map((p, idx) => (
              <span
                key={idx}
                className="tc-sparkle"
                style={{ '--tx': `${p.dx}px`, '--ty': `${p.dy}px` }}
              >
                ✦
              </span>
            ))}
          </div>
        ))}

      {/* Outer lagging compass / interactive badge */}
      <div ref={ringRef} className={`tc-outer tc-mode-${mode}`}>
        {mode === 'default' && (
          <div ref={ringRotRef} className="tc-compass-ring">
            <span className="tc-tick tc-n" />
            <span className="tc-tick tc-e" />
            <span className="tc-tick tc-s" />
            <span className="tc-tick tc-w" />
          </div>
        )}
        {mode === 'nav' && (
          <div className="tc-passport-stamp">
            <span>INDIA</span>
          </div>
        )}
        {mode === 'card' && (
          <div className="tc-card-pill">
            <MapPin size={12} className="text-[#f4772d]" />
            <span>Explore</span>
          </div>
        )}
        {mode === 'cta' && (
          <div className="tc-cta-plane">
            <Send size={14} />
          </div>
        )}
        {mode === 'chat' && (
          <div className="tc-chat-badge">
            <MessageCircle size={13} />
            <Sparkles size={10} className="text-[#ff9b56]" />
          </div>
        )}
        {mode === 'favorite' && (
          <div className="tc-heart-badge">
            <Heart size={15} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Inner instant saffron compass needle / diamond */}
      <div ref={innerRef} className={`tc-inner ${mode !== 'default' ? 'tc-inner-dim' : ''}`}>
        <span className="tc-diamond" />
      </div>
    </div>
  )
}
