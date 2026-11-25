import { ArrowRight, Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { categoryColor, placeFallbackImage, placeImage } from '../utils/media'
import { inr } from '../utils/planner'
import { getDestinationRating, getWeatherProfile, MONTHS_SHORT } from '../utils/ratings'

export function DestinationCard({ place, compact = false, rank = null, monthIndex = null }) {
  const { favorites, setFavorites, userRatings, selectedMonth } = useApp()
  const liked = favorites.includes(place.id)

  const activeMonth = monthIndex ?? selectedMonth
  const weather = place.weather || getWeatherProfile(place, activeMonth)
  const rating = place.rating || getDestinationRating(place, userRatings)

  const toggle = (event) => {
    event.preventDefault(); event.stopPropagation()
    setFavorites(liked ? favorites.filter((id) => id !== place.id) : [...favorites, place.id])
  }

  return (
    <article className={`destination-card group ${compact ? 'destination-card-compact' : ''}`}>
      <Link to={`/destination/${place.id}`} className="relative block overflow-hidden">
        <img
          src={placeImage(place)}
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1'
              e.currentTarget.src = placeFallbackImage(place)
            }
          }}
          alt={place.name}
          className="card-image"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#173D32]/75 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {rank && (
            <span className={`rank-pill ${rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : ''}`}>
              #{rank}
            </span>
          )}
          {!compact && (
            <span className={`weather-pill ${weather.badgeClass}`}>
              {weather.emoji} {weather.score}% {MONTHS_SHORT[activeMonth]}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          title={liked ? 'Remove from favourites' : 'Save to favourites'}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
            liked ? 'bg-[#D99B63] text-[#173D32]' : 'bg-[#FAF9F5]/90 text-[#173D32] hover:scale-105'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium text-[#FAF9F5]">
          <span className="flex items-center gap-1 truncate"><MapPin size={13} /> {place.state}</span>
          <span className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] backdrop-blur">{weather.tempRange}</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {place.categories.slice(0, 2).map((category) => (
              <span key={category} className={`tag ${categoryColor(category)}`}>{category}</span>
            ))}
          </div>
          <span className="rating-chip">
            <Star size={11} fill="currentColor" /> {rating.score}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-[var(--text-primary)]">{place.name}</h3>
        {!compact && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{place.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-color)] pt-3.5 mt-4">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Starting from</span>
            <strong className="text-sm font-bold text-[var(--text-primary)]">{inr(place.dailyBudget)}<span className="text-xs font-normal text-[var(--text-muted)]"> / day</span></strong>
          </div>
          <Link
            to={`/destination/${place.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E9E3D5] px-3.5 py-2 text-xs font-bold text-[#173D32] transition hover:bg-[#173D32] hover:text-[#FAF9F5]"
          >
            Explore More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}
