import { ArrowRight, Calendar, CloudSun, Compass, IndianRupee, MapPin, Search, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import destinations from '../data/destinations.json'
import { useApp } from '../context/AppContext'
import { DestinationCard } from '../components/DestinationCard'
import { JourneyScene } from '../components/JourneyScene'
import { TravelMap } from '../components/TravelMap'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { MONTHS_FULL, MONTHS_SHORT, rankDestinationsByMonth } from '../utils/ratings'

const popularIds = ['manali', 'jaipur', 'udaipur', 'palolem', 'rishikesh', 'shimla', 'srinagar', 'leh']
const HOME_CATEGORIES = ['All', 'Mountains', 'Beaches', 'Historical Places', 'Adventure', 'Nature']

function matchesCategory(place, cat) {
  if (cat === 'All') return true
  if (cat === 'Beaches') return place.categories.includes('Beach')
  if (cat === 'Historical Places') return place.categories.includes('Heritage')
  if (cat === 'Mountains') {
    return /himachal|kashmir|ladakh|uttarakhand|sikkim|arunachal|munnar|darjeeling|ooty|coorg/i.test(`${place.state} ${place.name} ${place.description}`)
  }
  return place.categories.includes(cat)
}

export default function Home() {
  const { selectedMonth, setSelectedMonth, userRatings, setIsChatOpen } = useApp()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const rankedForMonth = useMemo(
    () => rankDestinationsByMonth(destinations, selectedMonth, userRatings),
    [selectedMonth, userRatings],
  )
  const topWeatherPicks = rankedForMonth.slice(0, 3)

  const popularDestinations = useMemo(() => {
    const base = popularIds.map((id) => rankedForMonth.find((p) => p.id === id)).filter(Boolean)
    if (activeCategory === 'All') return base
    return rankedForMonth.filter((p) => matchesCategory(p, activeCategory)).slice(0, 8)
  }, [rankedForMonth, activeCategory])

  const onHeroSearch = (e) => {
    e.preventDefault()
    navigate(searchQuery.trim() ? `/explore?query=${encodeURIComponent(searchQuery.trim())}` : '/explore')
  }

  const exploreRef = useScrollReveal()
  const mapRef = useScrollReveal()
  const weatherRef = useScrollReveal()

  return <>
    {/* ── IMMERSIVE FULL-WIDTH HERO SECTION ── */}
    <section className="relative isolate overflow-hidden bg-[#173D32] text-[#FAF9F5]">
      <img
        src="/places/srinagar.jpg"
        alt="Mountain lake landscape"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#173D32]/75 via-[#173D32]/65 to-[#173D32]/90" />

      <div className="page-shell relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#B7C9A8]/40 bg-[#FAF9F5]/10 px-3.5 py-1.5 text-xs font-semibold text-[#E9E3D5] backdrop-blur">
            <Compass size={14} className="text-[#D99B63]" /> BharatYatra AI · Smart Travel Companion
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#FAF9F5] sm:text-6xl lg:text-7xl">
            The World Is Waiting. <span className="text-[#D99B63]">Let's Explore.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#E9E3D5]/95 sm:text-lg">
            Plan smarter, travel better with AI. Discover destinations, create personalized itineraries and explore the world within your budget.
          </p>

          {/* Destination Search Bar */}
          <form onSubmit={onHeroSearch} className="mt-8 flex max-w-2xl flex-col gap-2.5 rounded-2xl border border-white/15 bg-[#FAF9F5] p-2 shadow-xl sm:flex-row sm:items-center">
            <label className="relative flex flex-1 items-center">
              <Search size={18} className="ml-3 shrink-0 text-[#5C7068]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Manali, Jaipur, Udaipur, Goa, Kashmir..."
                className="w-full border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-[#173D32] placeholder:text-[#5C7068] outline-0"
              />
            </label>
            <button type="submit" className="btn-primary shrink-0 !rounded-xl">
              Search Places
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/explore" className="btn-accent">
              <Compass size={18} /> Explore Now
            </Link>
            <Link to="/planner" className="btn-secondary">
              <Sparkles size={18} /> Plan My Trip
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-xs font-medium text-[#B7C9A8]">
            <span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-[#D99B63]" /> 108 Curated Destinations</span>
            <span className="inline-flex items-center gap-1.5"><IndianRupee size={15} className="text-[#D99B63]" /> Visual Budget Breakdown</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#D99B63]" /> Works Offline with Local Save</span>
          </div>
        </div>
      </div>

      {/* 3D Animated Road-Trip Car Scene */}
      <JourneyScene />
    </section>

    {/* ── POPULAR DESTINATIONS DISCOVERY ── */}
    <section ref={exploreRef} className="page-shell py-14 sm:py-20 reveal visible">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>EXPLORE DESTINATIONS</p>
          <h2 className="section-title mt-2">Popular Places to Visit</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            From snow-dusted Himalayan valleys to sunlit coastal shores and royal heritage cities.
          </p>
        </div>
        <Link to="/explore" className="link-arrow">
          View all 108 destinations <ArrowRight size={16} />
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {HOME_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`interest-chip ${activeCategory === cat ? 'interest-chip-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {popularDestinations.map((place) => (
          <DestinationCard key={place.id} place={place} monthIndex={selectedMonth} />
        ))}
      </div>
    </section>

    {/* ── WEATHER & MONTH RANKING LEADERBOARD ── */}
    <section ref={weatherRef} className="border-y py-14 sm:py-18 reveal visible" style={{ background: 'var(--region-band-bg)', borderColor: 'var(--region-band-border)' }}>
      <div className="page-shell">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)' }}><CloudSun size={14} /> SEASONAL WEATHER RANKING</p>
            <h2 className="section-title mt-2">Top Ranked for {MONTHS_FULL[selectedMonth]}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Pick your travel month to see the highest-ranked destinations by weather comfort and traveller ratings.
            </p>
          </div>
          <Link to="/explore" className="btn-outline !py-2.5 self-start lg:self-auto">
            <Trophy size={16} className="text-[#D99B63]" /> Full Monthly Rankings
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {MONTHS_SHORT.map((m, idx) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(idx)}
              className={`month-pill ${selectedMonth === idx ? 'month-pill-active' : ''}`}
            >
              <Calendar size={12} /> {m}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topWeatherPicks.map((place) => (
            <DestinationCard key={place.id} place={place} rank={place.rank} monthIndex={selectedMonth} />
          ))}
        </div>
      </div>
    </section>

    {/* ── INTERACTIVE TRAVEL MAP ── */}
    <section ref={mapRef} className="page-shell py-14 sm:py-20 reveal visible">
      <TravelMap />
    </section>

    {/* ── CLEAN CTA BANNER ── */}
    <section className="page-shell pb-4">
      <div className="rounded-3xl bg-[#173D32] px-6 py-12 text-center text-[#FAF9F5] sm:px-12 sm:py-16">
        <p className="eyebrow-light justify-center">PERSONALIZED BY AI</p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Ready to design your next trip?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#B7C9A8]">
          Generate a complete day-by-day itinerary, interactive budget chart, and voice-guided tour in seconds.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/planner" className="btn-accent"><Sparkles size={17} /> Generate My Trip</Link>
          <button type="button" onClick={() => setIsChatOpen(true)} className="btn-secondary">Ask AI Assistant</button>
        </div>
      </div>
    </section>
  </>
}
