import { ArrowUpDown, Calendar, CloudSun, MapPinned } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DestinationCard } from '../components/DestinationCard'
import { FilterBar } from '../components/FilterBar'
import { useApp } from '../context/AppContext'
import destinations from '../data/destinations.json'
import { regions } from '../data/regions'
import { MONTHS_FULL, MONTHS_SHORT, rankDestinationsByMonth } from '../utils/ratings'

const EXPLORE_CATEGORIES = ['All', 'Mountains', 'Beaches', 'Historical Places', 'Adventure', 'Nature', 'Spiritual', 'Wildlife', 'Food']

function matchesCategory(place, cat) {
  if (cat === 'All') return true
  if (cat === 'Beaches') return place.categories.includes('Beach')
  if (cat === 'Historical Places') return place.categories.includes('Heritage')
  if (cat === 'Mountains') {
    return /himachal|kashmir|ladakh|uttarakhand|sikkim|arunachal|munnar|darjeeling|ooty|coorg/i.test(`${place.state} ${place.name} ${place.description}`)
  }
  return place.categories.includes(cat)
}

export default function Explore() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState({
    query: params.get('query') || '',
    state: params.get('state') || 'All',
    category: params.get('category') || 'All',
    zone: params.get('zone') || 'All',
  })
  const [sortBy, setSortBy] = useState('weather')
  const [peakOnly, setPeakOnly] = useState(false)
  const { t, selectedMonth, setSelectedMonth, userRatings } = useApp()

  const rankedAll = useMemo(
    () => rankDestinationsByMonth(destinations, selectedMonth, userRatings),
    [selectedMonth, userRatings],
  )

  const results = useMemo(() => {
    const filtered = rankedAll.filter((place) => {
      const query = filters.query.toLowerCase().trim()
      const aliases = place.state.toLowerCase().includes('jammu') ? 'kashmir' : place.state.toLowerCase().includes('ladakh') ? 'leh ladakh' : ''
      const searchable = `${place.name} ${place.state} ${aliases} ${place.description} ${place.categories.join(' ')}`.toLowerCase()
      return (
        (!query || searchable.includes(query)) &&
        (filters.state === 'All' || place.state === filters.state) &&
        matchesCategory(place, filters.category) &&
        (filters.zone === 'All' || place.zone === filters.zone) &&
        (!peakOnly || place.weather.score >= 82)
      )
    })

    if (sortBy === 'rating') return [...filtered].sort((a, b) => b.rating.score - a.rating.score)
    if (sortBy === 'budget-asc') return [...filtered].sort((a, b) => a.dailyBudget - b.dailyBudget)
    if (sortBy === 'days') return [...filtered].sort((a, b) => a.idealDays - b.idealDays)
    return filtered
  }, [rankedAll, filters, sortBy, peakOnly])

  return (
    <section className="page-shell pb-10 pt-10 sm:pt-14">
      <div className="max-w-3xl">
        <p className="eyebrow" style={{ color: 'var(--accent)' }}>DISCOVER 108 DESTINATIONS</p>
        <h1 className="page-title mt-2">Explore Destinations</h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
          Search across mountains, beaches, historical cities, and peaceful nature escapes — ranked live by month and weather.
        </p>
      </div>

      <div className="mt-8">
        <FilterBar filters={filters} onChange={setFilters} count={results.length} />
      </div>

      {/* Category Filter Pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {EXPLORE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilters({ ...filters, category: cat })}
            className={`interest-chip ${filters.category === cat ? 'interest-chip-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Month & Weather Ranking Bar */}
      <div className="themed-surface mt-5 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-card-soft)] text-[#173D32]">
              <CloudSun size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Weather Ranking for {MONTHS_FULL[selectedMonth]}</p>
              <p className="text-xs text-[var(--text-muted)]">Switch month to see best-in-season destinations</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPeakOnly((v) => !v)}
              className={`interest-chip ${peakOnly ? 'interest-chip-active' : ''}`}
            >
              Peak Weather Only
            </button>
            <label className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
              <ArrowUpDown size={13} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent outline-0">
                <option value="weather">Sort: Weather Rank</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="budget-asc">Sort: Lowest Budget</option>
                <option value="days">Sort: Shortest Trip</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {MONTHS_SHORT.map((m, idx) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(idx)}
              className={`month-pill ${selectedMonth === idx ? 'month-pill-active' : ''}`}
            >
              <Calendar size={11} /> {m}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Region Chips */}
      <div className="themed-surface mt-5 flex flex-wrap items-center gap-2 rounded-2xl p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] mr-2">
          <MapPinned size={15} style={{ color: 'var(--accent)' }} /> Popular Regions:
        </span>
        {['All', 'Himachal Pradesh', 'Rajasthan', 'Goa', 'Uttarakhand', 'Jammu and Kashmir', 'Ladakh', 'Kerala'].map((st) => {
          const region = regions.find((r) => r.name === st)
          const active = filters.state === st
          return (
            <button
              key={st}
              onClick={() => setFilters({ ...filters, state: st })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? 'bg-[#173D32] text-[#FAF9F5]' : 'bg-[var(--bg-card-soft)] text-[var(--text-primary)] hover:opacity-85'
              }`}
            >
              {st === 'All' ? 'All India' : `${region?.emoji || ''} ${st}`}
            </button>
          )
        })}
      </div>

      {results.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((place) => (
            <DestinationCard key={place.id} place={place} rank={place.rank} monthIndex={selectedMonth} />
          ))}
        </div>
      ) : (
        <div className="themed-surface mt-12 rounded-3xl border-dashed p-12 text-center">
          <div className="text-4xl">🧭</div>
          <h2 className="mt-4 font-display text-2xl font-bold text-[var(--text-primary)]">{t.noResults}</h2>
          <button
            className="btn-outline mt-5"
            onClick={() => { setFilters({ query: '', state: 'All', category: 'All', zone: 'All' }); setPeakOnly(false) }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </section>
  )
}
