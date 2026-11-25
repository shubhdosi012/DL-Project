import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  CloudSun,
  Compass,
  Heart,
  IndianRupee,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Sparkles,
  Star,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import destinations from '../data/destinations.json'
import { DestinationCard } from '../components/DestinationCard'
import { useApp } from '../context/AppContext'
import { useSpeech } from '../hooks/useSpeech'
import { categoryColor, placeFallbackImage, placeImage } from '../utils/media'
import { inr } from '../utils/planner'
import {
  getDestinationRating,
  getWeatherProfile,
  MONTHS_FULL,
  MONTHS_SHORT,
  rankDestinationsByMonth,
} from '../utils/ratings'
import { useScrollReveal } from '../hooks/useScrollReveal'

const VIBE_TAGS = ['Scenic Views', 'Great Food', 'Peaceful', 'Value Pick', 'Must-Visit', 'Photogenic']

export default function DestinationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, favorites, setFavorites, language, userRatings, rateDestination, selectedMonth, setSelectedMonth } = useApp()
  const place = destinations.find((item) => item.id === id)
  const contentRef = useScrollReveal()
  const { speakingId, loadingId, speak } = useSpeech(language)

  const existingUser = place ? userRatings[place.id] : null
  const [hoverStar, setHoverStar] = useState(0)
  const [stars, setStars] = useState(existingUser?.stars || 5)
  const [pickedTags, setPickedTags] = useState(existingUser?.tags || ['Scenic Views'])
  const [note, setNote] = useState(existingUser?.note || '')
  const [justRated, setJustRated] = useState(false)

  const rankedList = useMemo(
    () => rankDestinationsByMonth(destinations, selectedMonth, userRatings),
    [selectedMonth, userRatings],
  )

  if (!place) return <section className="page-shell py-20"><h1 className="page-title">Destination not found.</h1><Link to="/explore" className="btn-primary mt-6">{t.back}</Link></section>

  const liked = favorites.includes(place.id)
  const toggle = () => setFavorites(liked ? favorites.filter((item) => item !== place.id) : [...favorites, place.id])

  const rankedPlace = rankedList.find((p) => p.id === place.id)
  const weather = rankedPlace?.weather || getWeatherProfile(place, selectedMonth)
  const rating = rankedPlace?.rating || getDestinationRating(place, userRatings)

  const related = destinations
    .filter((d) => d.id !== place.id && (d.zone === place.zone || d.categories.some((c) => place.categories.includes(c))))
    .slice(0, 3)

  const audioGuideScript = `${place.name} in ${place.state}. Rated ${rating.score} out of 5 by ${rating.count} travellers. ${place.description} Highlights include ${place.highlights.join(' and ')}. In ${MONTHS_FULL[selectedMonth]}, weather match is ${weather.score} percent (${weather.label}, ${weather.tempRange}).`

  const submitRating = (e) => {
    e.preventDefault()
    rateDestination(place.id, { stars, tags: pickedTags, note: note.trim() })
    setJustRated(true)
    setTimeout(() => setJustRated(false), 3000)
  }

  const toggleTag = (tag) => {
    setPickedTags((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag]))
  }

  return <>
    <section className="page-shell pt-6 sm:pt-10">
      <Link to="/explore" className="back-link"><ArrowLeft size={17} /> {t.back}</Link>
      <div className="group relative mt-5 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]" style={{ background: 'var(--hero-from)' }}>
        <img
          src={placeImage(place)}
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1'
              e.currentTarget.src = placeFallbackImage(place)
            }
          }}
          alt={place.name}
          className="h-[410px] w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105 sm:h-[510px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071c3c] via-[#071c3c]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {rankedPlace && (
              <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white shadow" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                Rank #{rankedPlace.rank} in {MONTHS_SHORT[selectedMonth]}
              </span>
            )}
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#071c3c]">
              ★ {rating.score} ({rating.count})
            </span>
            {place.categories.map((category) => <span key={category} className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#071c3c] backdrop-blur">{category}</span>)}
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">{place.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
            <span className="inline-flex items-center gap-1.5"><MapPin size={16} /> {place.state} · {place.zone} India</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs backdrop-blur">
              {weather.emoji} {weather.label} ({weather.tempRange})
            </span>
          </p>
        </div>
        <div className="absolute right-5 top-5 flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-bold text-[#071c3c] backdrop-blur transition-all duration-300 hover:scale-105"
            onClick={() => speak(place.id, audioGuideScript)}
          >
            {loadingId === place.id ? <Loader2 size={16} className="animate-spin" /> : speakingId === place.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="hidden sm:inline">{speakingId === place.id ? 'Stop Guide' : 'Audio Guide'}</span>
          </button>
          <button className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold backdrop-blur transition-all duration-300 ${liked ? 'scale-105 text-white' : 'bg-white/90 text-[#071c3c] hover:scale-105'}`} style={liked ? { background: 'var(--accent)' } : undefined} onClick={toggle}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {liked ? t.unfavourite : t.favourite}
          </button>
        </div>
      </div>
    </section>

    <section ref={contentRef} className="page-shell mt-8 grid gap-7 lg:grid-cols-[1.35fr_.65fr] reveal visible">
      <div>
        <p className="eyebrow" style={{ color: 'var(--accent)' }}>{t.about}</p>
        <h2 className="section-title mt-3">A place to linger.</h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">{place.description} BharatYatra has paired this stop with thoughtful pacing, local flavours and enough room for discovery.</p>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          {place.highlights.map((highlight, index) => <div key={highlight} className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] p-4 transition-all duration-200 hover:translate-x-1 hover:shadow-md">
            <span className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>0{index + 1}</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{highlight}</span>
          </div>)}
        </div>

        {/* 12-Month Weather & Ranking Calendar */}
        <div className="themed-surface mt-9 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}><CloudSun size={14} /> 12-MONTH WEATHER & RANKING</p>
              <h3 className="mt-1 font-display text-xl font-bold text-[var(--text-primary)]">
                {MONTHS_FULL[selectedMonth]}: {weather.emoji} {weather.label} ({weather.score}% match)
              </h3>
            </div>
            <span className="rounded-full bg-[var(--bg-card-soft)] px-3 py-1 text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
              Rank #{rankedPlace?.rank} of {destinations.length}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
            {MONTHS_SHORT.map((m, idx) => {
              const mw = getWeatherProfile(place, idx)
              const active = idx === selectedMonth
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(idx)}
                  className={`month-calendar-cell ${mw.badgeClass} ${active ? 'ring-2 ring-[var(--accent)] ring-offset-1 scale-105' : ''}`}
                  title={`${MONTHS_FULL[idx]}: ${mw.label} (${mw.score}%) • ${mw.tempRange}`}
                >
                  <span className="text-[10px] font-extrabold">{m}</span>
                  <span className="text-sm leading-none">{mw.emoji}</span>
                  <span className="text-[9px] font-bold opacity-85">{mw.score}%</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Traveller Ratings & Interactive Review Section */}
        <div className="themed-surface mt-9 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}><Award size={14} /> TRAVELLER RATINGS</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-[var(--text-primary)]">{rating.score}</span>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={15} fill={n <= Math.round(rating.score) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--text-muted)]">Based on {rating.count} traveller ratings</p>
                </div>
              </div>
            </div>
            {rating.userEntry && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                ✓ You rated {rating.userEntry.stars}★
              </span>
            )}
          </div>

          {/* Sub-score Animated Bars */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Scenery & Views', rating.breakdown.scenery],
              ['Culture & Vibe', rating.breakdown.culture],
              ['Value for Money', rating.breakdown.value],
              ['Travel Comfort', rating.breakdown.comfort],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl bg-[var(--bg-card-soft)] p-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>{label}</span>
                  <span style={{ color: 'var(--accent)' }}>{val} / 5</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                  <div className="rating-bar-fill h-full rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Rate Form */}
          <form onSubmit={submitRating} className="mt-6 border-t border-[var(--border-color)] pt-5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
              <MessageSquarePlus size={16} style={{ color: 'var(--accent)' }} />
              {rating.userEntry ? 'Update your rating' : `Rate ${place.name}`}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setStars(n)}
                  className="p-1 transition-transform hover:scale-125"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    size={24}
                    className={(hoverStar || stars) >= n ? 'text-amber-400' : 'text-slate-300'}
                    fill={(hoverStar || stars) >= n ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-[var(--text-muted)]">{stars} / 5 stars</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {VIBE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`interest-chip !py-1 !text-[11px] ${pickedTags.includes(tag) ? 'interest-chip-active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share a quick travel tip (saved locally)..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary shrink-0">
                {justRated ? 'Saved ✓' : rating.userEntry ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>

            {rating.userEntry?.note && (
              <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] p-3.5 text-xs">
                <p className="font-bold text-[var(--text-primary)]">Your Travel Note ({rating.userEntry.stars}★)</p>
                <p className="mt-1 text-[var(--text-secondary)]">“{rating.userEntry.note}”</p>
                {rating.userEntry.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rating.userEntry.tags.map((tg) => (
                      <span key={tg} className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{tg}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="mt-9 rounded-3xl p-6 text-white sm:p-7" style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}>
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}><Sparkles size={21} /></span>
            <div>
              <p className="font-display text-xl font-bold">Build this into your journey</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">Start with {place.name}, then tailor a day-by-day plan and transparent cost estimate.</p>
              <button onClick={() => navigate('/planner', { state: { prefill: [place.id], region: place.zone } })} className="btn-primary mt-5">{t.startPlanning} <Compass size={17} /></button>
            </div>
          </div>
        </div>
      </div>

      <aside className="themed-surface h-fit rounded-3xl p-5 shadow-sm sm:p-6">
        <p className="font-display text-xl font-bold text-[var(--text-primary)]">Good to know</p>
        <Info icon={<CalendarDays />} label={t.bestTime} value={place.bestTime} />
        <Info icon={<CloudSun />} label={`${MONTHS_FULL[selectedMonth]} Weather`} value={`${weather.emoji} ${weather.label} • ${weather.tempRange}`} />
        <Info icon={<Timer />} label="Ideal stay" value={`${place.idealDays} ${place.idealDays === 1 ? 'day' : 'days'}`} />
        <Info icon={<IndianRupee />} label="Typical spend" value={`${inr(place.dailyBudget)} ${t.perDay}`} />
        <div className="mt-6 border-t border-[var(--border-color)] pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.idealFor}</p>
          <div className="mt-3 flex flex-wrap gap-2">{place.categories.map((category) => <span key={category} className={`tag ${categoryColor(category)}`}><Check size={12} />{category}</span>)}</div>
        </div>
      </aside>
    </section>

    {related.length > 0 && (
      <section className="page-shell mt-14">
        <p className="eyebrow" style={{ color: 'var(--accent)' }}>NEARBY ATTRACTIONS</p>
        <h2 className="section-title mt-2">Nearby & Related Attractions</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => <DestinationCard key={item.id} place={item} />)}
        </div>
      </section>
    )}
  </>
}

function Info({ icon, label, value }) {
  return <div className="mt-5 flex gap-3 border-b border-[var(--border-color)] pb-5">
    <span className="mt-0.5" style={{ color: 'var(--accent)' }}>{icon}</span>
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[var(--text-primary)]">{value}</p>
    </div>
  </div>
}
