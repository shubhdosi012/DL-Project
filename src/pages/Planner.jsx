import {
  Backpack,
  BedDouble,
  Bus,
  Calendar,
  Check,
  Compass,
  Download,
  Heart,
  IndianRupee,
  Lightbulb,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Users,
  Utensils,
  Volume2,
  VolumeX,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import destinations from '../data/destinations.json'
import { useApp } from '../context/AppContext'
import { useSpeech } from '../hooks/useSpeech'
import { calculateDetailedBudget, generateDetailedItinerary, inr } from '../utils/planner'

const PREFERENCES = ['Solo', 'Friends', 'Family', 'Couple']
const INTERESTS = ['Adventure', 'Nature', 'Food', 'Historical Places', 'Relaxation']

function toDateInput(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000)
  return d.toISOString().slice(0, 10)
}

export default function Planner() {
  const location = useLocation()
  const { setTrips, language } = useApp()
  const prefillId = location.state?.prefill?.[0]
  const { speakingId, loadingId, speak } = useSpeech(language)

  const [form, setForm] = useState({
    startingLocation: 'New Delhi',
    destinationId: prefillId || 'manali',
    departureDate: toDateInput(7),
    returnDate: toDateInput(10),
    travelers: 2,
    budgetPerPerson: 18000,
    preference: 'Couple',
    interests: ['Nature', 'Adventure'],
  })

  const [itinerary, setItinerary] = useState([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [packed, setPacked] = useState({})

  useEffect(() => {
    if (prefillId) setForm((f) => ({ ...f, destinationId: prefillId }))
  }, [prefillId])

  const selectedPlace = useMemo(
    () => destinations.find((p) => p.id === form.destinationId) || destinations[0],
    [form.destinationId],
  )

  const daysCount = useMemo(() => {
    const start = new Date(form.departureDate)
    const end = new Date(form.returnDate)
    const diff = Math.round((end - start) / 86400000) + 1
    return Number.isNaN(diff) ? 4 : Math.max(1, Math.min(14, diff))
  }, [form.departureDate, form.returnDate])

  const budget = useMemo(
    () =>
      calculateDetailedBudget({
        place: selectedPlace,
        days: daysCount,
        travelers: form.travelers,
        budgetPerPerson: form.budgetPerPerson,
      }),
    [selectedPlace, daysCount, form.travelers, form.budgetPerPerson],
  )

  const updateForm = (key, val) => {
    setSaved(false)
    setError('')
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  const toggleInterest = (item) => {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((x) => x !== item)
        : [...prev.interests, item],
    }))
  }

  const handleGenerate = (e) => {
    e.preventDefault()
    if (!form.startingLocation.trim()) {
      setError('Please enter a starting location.')
      return
    }
    if (new Date(form.returnDate) < new Date(form.departureDate)) {
      setError('Return date cannot be earlier than departure date.')
      return
    }
    const generated = generateDetailedItinerary({
      ...form,
      place: selectedPlace,
    })
    setItinerary(generated)
    setSaved(false)
    setTimeout(() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const handleSaveTrip = () => {
    if (!itinerary.length) return
    const tripRecord = {
      id: crypto.randomUUID(),
      name: `${selectedPlace.name} (${form.preference} Trip)`,
      startingLocation: form.startingLocation,
      destinationId: selectedPlace.id,
      departureDate: form.departureDate,
      returnDate: form.returnDate,
      preferences: {
        days: daysCount,
        travelers: form.travelers,
        style: form.preference,
        interests: form.interests,
        region: selectedPlace.zone,
      },
      selectedIds: [selectedPlace.id],
      itinerary,
      budget,
      notes: '',
      savedAt: new Date().toISOString(),
    }
    setTrips((prev) => [tripRecord, ...prev])
    setSaved(true)
  }

  const packingList = useMemo(() => {
    const items = ['Government ID & Tickets', 'Power Bank & Universal Charger', 'Refillable Water Bottle', 'Basic First-Aid Kit']
    if (form.interests.includes('Adventure')) items.push('Sturdy Trekking / Walking Shoes')
    if (form.interests.includes('Relaxation')) items.push('Sunglasses & Hat')
    if (selectedPlace.categories.includes('Beach')) items.push('Sunscreen & Swimwear')
    if (/himachal|kashmir|ladakh|uttarakhand|sikkim/i.test(selectedPlace.state)) items.push('Warm Thermal Jacket & Lip Balm')
    return items
  }, [form.interests, selectedPlace])

  const listenItinerary = () => {
    const script = itinerary
      .map((d) => `Day ${d.day}, ${d.dateLabel}: ${d.phase}. Attractions: ${d.attractions.join(', ')}. ${d.activities.join(' ')}`)
      .join(' ')
    speak(
      'bharatyatra-itinerary',
      `Here is your ${daysCount}-day BharatYatra itinerary from ${form.startingLocation} to ${selectedPlace.name} for ${form.travelers} travellers. Total estimated budget is ${inr(budget.total)}. ${script}`,
    )
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow" style={{ color: 'var(--accent)' }}>AI TRIP PLANNER</p>
        <h1 className="page-title mt-2">Plan Your Trip with AI</h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
          Enter your route, travel dates, group style, and budget to generate a day-by-day itinerary and visual expense breakdown.
        </p>
      </div>

      {/* ── INTERACTIVE TRIP PLANNING FORM ── */}
      <form onSubmit={handleGenerate} className="themed-surface mt-9 rounded-3xl p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Starting Location</span>
            <input
              value={form.startingLocation}
              onChange={(e) => updateForm('startingLocation', e.target.value)}
              placeholder="e.g., New Delhi, Mumbai, Bengaluru"
              className="input"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Destination</span>
            <select
              value={form.destinationId}
              onChange={(e) => updateForm('destinationId', e.target.value)}
              className="input"
            >
              {destinations.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.state})</option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Number of Travellers</span>
            <div className="flex h-[46px] items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
              <button type="button" className="stepper-button" onClick={() => updateForm('travelers', Math.max(1, form.travelers - 1))}><Minus size={15} /></button>
              <strong className="text-sm text-[var(--text-primary)]">{form.travelers} {form.travelers === 1 ? 'Traveller' : 'Travellers'}</strong>
              <button type="button" className="stepper-button" onClick={() => updateForm('travelers', Math.min(20, form.travelers + 1))}><Plus size={15} /></button>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Departure Date</span>
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => updateForm('departureDate', e.target.value)}
              className="input"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Return Date ({daysCount} days)</span>
            <input
              type="date"
              value={form.returnDate}
              min={form.departureDate}
              onChange={(e) => updateForm('returnDate', e.target.value)}
              className="input"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Budget Per Person</span>
              <strong className="text-sm font-bold text-[#173D32]">{inr(form.budgetPerPerson)}</strong>
            </div>
            <input
              type="range"
              min="5000"
              max="80000"
              step="1000"
              value={form.budgetPerPerson}
              onChange={(e) => updateForm('budgetPerPerson', Number(e.target.value))}
              className="mt-2.5 w-full accent-[#173D32]"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-[var(--border-color)] pt-6 md:grid-cols-2">
          <div>
            <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Travel Preference</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PREFERENCES.map((pref) => (
                <button
                  type="button"
                  key={pref}
                  onClick={() => updateForm('preference', pref)}
                  className={`choice !justify-center ${form.preference === pref ? 'choice-active' : ''}`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Interests</span>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const active = form.interests.includes(item)
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`interest-chip ${active ? 'interest-chip-active' : ''}`}
                  >
                    {active && <Check size={13} />} {item}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-800">{error}</p>}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            Suggested starting rate for {selectedPlace.name}: <strong>{inr(selectedPlace.dailyBudget)} / person / day</strong>
          </p>
          <button type="submit" className="btn-accent !px-6 !py-3.5 text-base">
            <Sparkles size={18} /> Generate My Trip with AI
          </button>
        </div>
      </form>

      {/* ── GENERATED ITINERARY + VISUAL BUDGET CALCULATOR ── */}
      {itinerary.length > 0 && (
        <div id="itinerary" className="mt-12 scroll-mt-24 space-y-10 print:mt-0">
          {/* Header & Actions */}
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#173D32] p-6 text-[#FAF9F5] sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="eyebrow-light">PERSONALIZED AI ITINERARY</p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                {form.startingLocation} → {selectedPlace.name} ({daysCount} Days)
              </h2>
              <p className="mt-1 text-sm text-[#B7C9A8]">
                {form.travelers} {form.travelers === 1 ? 'Traveller' : 'Travellers'} · {form.preference} · {form.interests.join(', ') || 'Explorer'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button type="button" onClick={listenItinerary} className="btn-secondary !py-2.5 text-xs">
                {loadingId === 'bharatyatra-itinerary' ? <Loader2 size={15} className="animate-spin" /> : speakingId === 'bharatyatra-itinerary' ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {speakingId === 'bharatyatra-itinerary' ? 'Stop Audio' : 'ElevenLabs Voice Guide'}
              </button>
              <button type="button" onClick={() => window.print()} className="btn-secondary !py-2.5 text-xs">
                <Download size={15} /> Download PDF
              </button>
              <button type="button" onClick={handleSaveTrip} className="btn-accent !py-2.5 text-xs">
                {saved ? <Check size={15} /> : <Heart size={15} />} {saved ? 'Saved to My Trips' : 'Save Trip'}
              </button>
            </div>
          </div>

          {/* ── DAY-BY-DAY TIMELINE LAYOUT ── */}
          <div className="relative space-y-5 pl-6 before:absolute before:bottom-4 before:left-2.5 before:top-4 before:w-0.5 before:bg-[#B7C9A8]">
            {itinerary.map((item) => (
              <article key={item.day} className="themed-surface relative rounded-2xl p-5 shadow-sm sm:p-6">
                <span className="absolute -left-[22px] top-6 grid h-6 w-6 place-items-center rounded-full bg-[#173D32] text-[10px] font-bold text-[#FAF9F5] ring-4 ring-[var(--bg-base)]">
                  {item.day}
                </span>

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D99B63]">
                      Day {item.day} · {item.dateLabel}
                    </p>
                    <h3 className="mt-0.5 font-display text-xl font-bold text-[var(--text-primary)]">{item.phase}</h3>
                  </div>
                  <span className="rounded-full bg-[var(--bg-card-soft)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                    Est. {inr(item.estimatedExpense)}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <MapPin size={13} className="text-[#D99B63]" /> Recommended Attractions
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.attractions.map((a) => (
                        <span key={a} className="rounded-lg bg-[#E9E3D5] px-2.5 py-1 text-xs font-semibold text-[#173D32]">{a}</span>
                      ))}
                    </div>

                    <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <Compass size={13} className="text-[#D99B63]" /> Suggested Activities
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
                      {item.activities.map((act) => (
                        <li key={act} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#173D32]" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-2xl bg-[var(--bg-card-soft)] p-4 text-xs">
                    <div className="flex gap-2">
                      <Utensils size={15} className="mt-0.5 shrink-0 text-[#173D32]" />
                      <div>
                        <strong className="block text-[var(--text-primary)]">Food Suggestion</strong>
                        <span className="text-[var(--text-secondary)]">{item.food}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <BedDouble size={15} className="mt-0.5 shrink-0 text-[#173D32]" />
                      <div>
                        <strong className="block text-[var(--text-primary)]">Accommodation</strong>
                        <span className="text-[var(--text-secondary)]">{item.accommodation}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Lightbulb size={15} className="mt-0.5 shrink-0 text-[#D99B63]" />
                      <div>
                        <strong className="block text-[var(--text-primary)]">Travel Tip</strong>
                        <span className="text-[var(--text-secondary)]">{item.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ── VISUAL BUDGET CALCULATOR DASHBOARD ── */}
          <BudgetDashboard budget={budget} />

          {/* ── TRAVEL PACKING CHECKLIST ── */}
          <div className="themed-surface rounded-3xl p-6 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow" style={{ color: 'var(--accent)' }}><Backpack size={14} /> TRAVEL CHECKLIST</p>
                <h3 className="mt-1 font-display text-xl font-bold text-[var(--text-primary)]">Packing Checklist for {selectedPlace.name}</h3>
              </div>
              <span className="rounded-full bg-[var(--bg-card-soft)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                {packingList.filter((i) => packed[i]).length} / {packingList.length} packed
              </span>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {packingList.map((item) => {
                const done = !!packed[item]
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPacked((p) => ({ ...p, [item]: !p[item] }))}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                      done ? 'border-[#173D32] bg-[var(--bg-card-soft)] line-through opacity-75' : 'border-[var(--border-color)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${done ? 'border-[#173D32] bg-[#173D32] text-white' : 'border-[var(--border-color)]'}`}>
                      {done && <Check size={11} />}
                    </span>
                    <span>{item}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function BudgetDashboard({ budget }) {
  const categories = [
    { label: 'Transportation', value: budget.transport, pct: 26, color: '#173D32', icon: <Bus size={15} /> },
    { label: 'Accommodation', value: budget.accommodation, pct: 34, color: '#2F6B59', icon: <BedDouble size={15} /> },
    { label: 'Food & Dining', value: budget.food, pct: 18, color: '#D99B63', icon: <Utensils size={15} /> },
    { label: 'Activities & Sightseeing', value: budget.activities, pct: 14, color: '#B7C9A8', icon: <Compass size={15} /> },
    { label: 'Other Expenses', value: budget.other, pct: 8, color: '#8C7B65', icon: <Wallet size={15} /> },
  ]

  // Build SVG donut chart segments
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <div className="themed-surface rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}><IndianRupee size={14} /> BUDGET CALCULATOR</p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)]">Visual Expense Breakdown</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {budget.days} days · {budget.travelers} {budget.travelers === 1 ? 'traveller' : 'travellers'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl bg-[#173D32] px-4 py-3 text-[#FAF9F5]">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#B7C9A8]">Total Estimated Cost</span>
            <strong className="font-display text-xl font-bold">{inr(budget.total)}</strong>
          </div>
          <div className="rounded-2xl bg-[#E9E3D5] px-4 py-3 text-[#173D32]">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C7068]">Cost Per Person</span>
            <strong className="font-display text-xl font-bold">{inr(budget.perPerson)}</strong>
          </div>
        </div>
      </div>

      <div className="mt-7 grid items-center gap-8 md:grid-cols-[220px_1fr]">
        {/* Clean SVG Donut Chart */}
        <div className="relative mx-auto h-48 w-48">
          <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
            {categories.map((cat) => {
              const dash = (cat.pct / 100) * circumference
              const offset = -(cumulative / 100) * circumference
              cumulative += cat.pct
              return (
                <circle
                  key={cat.label}
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="16"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Per Person</span>
            <strong className="font-display text-lg font-bold text-[var(--text-primary)]">{inr(budget.perPerson)}</strong>
          </div>
        </div>

        {/* Category Breakdown Bars */}
        <div className="space-y-3.5">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-[var(--text-primary)]">
                  <span className="grid h-6 w-6 place-items-center rounded-md text-white" style={{ background: cat.color }}>
                    {cat.icon}
                  </span>
                  {cat.label} ({cat.pct}%)
                </span>
                <strong className="text-[var(--text-primary)]">{inr(cat.value)}</strong>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--bg-card-soft)]">
                <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
