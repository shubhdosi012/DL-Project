import { ArrowRight, Compass, MapPin, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import destinations from '../data/destinations.json'
import { INDIA_ISLAND_PATHS, INDIA_MAINLAND_PATH, INDIA_STATE_PATHS } from '../data/indiaMapData'
import { useApp } from '../context/AppContext'
import { placeFallbackImage, placeImage } from '../utils/media'
import { inr } from '../utils/planner'
import { getDestinationRating, getWeatherProfile, MONTHS_SHORT } from '../utils/ratings'

const REAL_COORDS = [
  { id: 'leh', lon: 77.58, lat: 34.15 },
  { id: 'srinagar', lon: 74.79, lat: 34.08 },
  { id: 'manali', lon: 77.19, lat: 32.24 },
  { id: 'shimla', lon: 77.17, lat: 31.10 },
  { id: 'amritsar', lon: 74.87, lat: 31.63 },
  { id: 'rishikesh', lon: 78.27, lat: 30.09 },
  { id: 'jaipur', lon: 75.79, lat: 26.91 },
  { id: 'agra', lon: 78.01, lat: 27.18 },
  { id: 'jaisalmer', lon: 70.91, lat: 26.91 },
  { id: 'udaipur', lon: 73.71, lat: 24.58 },
  { id: 'varanasi', lon: 82.97, lat: 25.32 },
  { id: 'rann-of-kutch', lon: 69.86, lat: 23.73 },
  { id: 'darjeeling', lon: 88.26, lat: 27.04 },
  { id: 'tawang', lon: 91.86, lat: 27.59 },
  { id: 'kaziranga', lon: 93.36, lat: 26.58 },
  { id: 'mumbai', lon: 72.88, lat: 19.08 },
  { id: 'palolem', lon: 74.02, lat: 15.01 },
  { id: 'hampi', lon: 76.46, lat: 15.34 },
  { id: 'munnar', lon: 77.06, lat: 10.09 },
  { id: 'alleppey', lon: 76.34, lat: 9.49 },
  { id: 'havelock', x: 516.7, y: 565.3 },
  { id: 'kavaratti', x: 96.0, y: 582.0 },
]

// Exact linear calibration matching INDIA_MAINLAND_PATH bounds in 600x700 viewBox
function project(lon, lat) {
  const x = 20 + ((lon - 68.18) / (97.39 - 68.18)) * (579.4 - 20)
  const y = 25.2 + ((37.09 - lat) / (37.09 - 8.07)) * (650.1 - 25.2)
  return [Number(x.toFixed(1)), Number(y.toFixed(1))]
}

export function TravelMap() {
  const { selectedMonth, userRatings } = useApp()
  const [activeId, setActiveId] = useState('manali')
  const [zoneFilter, setZoneFilter] = useState('All')

  const activePlace = destinations.find((d) => d.id === activeId) || destinations[0]
  const weather = getWeatherProfile(activePlace, selectedMonth)
  const rating = getDestinationRating(activePlace, userRatings)

  const visiblePins = REAL_COORDS.filter((pin) => {
    if (zoneFilter === 'All') return true
    const p = destinations.find((d) => d.id === pin.id)
    return p?.zone === zoneFilter
  })

  return (
    <div className="themed-surface overflow-hidden rounded-3xl p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}><Compass size={14} /> INTERACTIVE INDIA TRAVEL MAP</p>
          <h2 className="section-title mt-2">Explore India on the Map</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Detailed political map of India with state boundaries, islands, live weather, ratings, and starting budgets.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['All', 'North', 'West', 'South', 'East', 'Northeast', 'Islands'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`month-pill ${zoneFilter === z ? 'month-pill-active' : ''}`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid items-center gap-6 lg:grid-cols-[1.15fr_.85fr]">
        {/* Proper Geographic India SVG Map */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[#173D32] p-3 shadow-inner sm:p-5">
          <svg viewBox="0 0 600 700" className="mx-auto max-h-[540px] w-full" aria-label="Accurate Interactive Map of India">
            <defs>
              <radialGradient id="indiaSurface" cx="48%" cy="48%" r="55%">
                <stop offset="0%" stopColor="#266351" />
                <stop offset="100%" stopColor="#1B483B" />
              </radialGradient>
            </defs>

            {/* Geographic Lat/Lon Graticule */}
            {[70, 75, 80, 85, 90, 95].map((lon) => {
              const [x] = project(lon, 20)
              return <line key={`lon-${lon}`} x1={x} y1="15" x2={x} y2="685" stroke="#B7C9A8" strokeOpacity="0.11" strokeWidth="1" strokeDasharray="3 5" />
            })}
            {[10, 15, 20, 23.5, 25, 30, 35].map((lat) => {
              const [, y] = project(80, lat)
              return (
                <g key={`lat-${lat}`}>
                  <line
                    x1="15"
                    y1={y}
                    x2="585"
                    y2={y}
                    stroke={lat === 23.5 ? '#D99B63' : '#B7C9A8'}
                    strokeOpacity={lat === 23.5 ? 0.25 : 0.11}
                    strokeWidth="1"
                    strokeDasharray={lat === 23.5 ? '6 4' : '3 5'}
                  />
                  {lat === 23.5 && (
                    <text x="20" y={y - 5} fill="#D99B63" fillOpacity="0.6" fontSize="9.5" fontWeight="600">
                      Tropic of Cancer (23.5°N)
                    </text>
                  )}
                </g>
              )
            })}

            {/* Mainland India Outline */}
            <path
              d={INDIA_MAINLAND_PATH}
              fill="url(#indiaSurface)"
              stroke="#B7C9A8"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Internal State & Territory Borders */}
            <g fill="none" stroke="#B7C9A8" strokeOpacity="0.34" strokeWidth="1" strokeLinejoin="round">
              {INDIA_STATE_PATHS.map((d, idx) => (
                <path key={`st-${idx}`} d={d} />
              ))}
            </g>

            {/* Andaman & Nicobar and Lakshadweep Islands */}
            <g fill="#266351" stroke="#B7C9A8" strokeWidth="1">
              {INDIA_ISLAND_PATHS.map((d, idx) => (
                <path key={`isl-${idx}`} d={d} />
              ))}
            </g>

            {/* Sea Labels */}
            <text x="48" y="545" fill="#B7C9A8" fillOpacity="0.48" fontSize="11" fontWeight="600" letterSpacing="2">
              ARABIAN SEA
            </text>
            <text x="372" y="505" fill="#B7C9A8" fillOpacity="0.48" fontSize="11" fontWeight="600" letterSpacing="2">
              BAY OF BENGAL
            </text>

            {/* Destination Pins */}
            {visiblePins.map((pin) => {
              const [x, y] = pin.x !== undefined ? [pin.x, pin.y] : project(pin.lon, pin.lat)
              const isSelected = pin.id === activeId
              const placeObj = destinations.find((d) => d.id === pin.id)
              return (
                <g
                  key={pin.id}
                  onClick={() => setActiveId(pin.id)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <>
                      <circle cx={x} cy={y} r="15" fill="#D99B63" opacity="0.24" />
                      <circle cx={x} cy={y} r="9" fill="#D99B63" opacity="0.45" />
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={isSelected ? '#D99B63' : '#FAF9F5'}
                    stroke="#173D32"
                    strokeWidth="2"
                  />
                  {isSelected && placeObj && (
                    <g transform={`translate(${Math.min(445, x + 10)}, ${Math.max(24, y - 6)})`}>
                      <rect x="0" y="-11" width={placeObj.name.length * 6.4 + 16} height="20" rx="6" fill="#FAF9F5" />
                      <text x="8" y="3" fill="#173D32" fontSize="10.5" fontWeight="700">
                        {placeObj.name}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#B7C9A8]">
            <span>Click any destination pin to inspect</span>
            <span>{visiblePins.length} pins shown</span>
          </div>
        </div>

        {/* Selected Pin Detail Card */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-soft)]">
          <div className="relative h-48 overflow-hidden bg-[#173D32]">
            <img
              src={placeImage(activePlace)}
              onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = '1'
                  e.currentTarget.src = placeFallbackImage(activePlace)
                }
              }}
              alt={activePlace.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#173D32]/85 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-semibold text-[#FAF9F5]">
              <span className="inline-flex items-center gap-1"><MapPin size={13} className="text-[#D99B63]" /> {activePlace.state}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 backdrop-blur">
                <Star size={12} fill="#D99B63" className="text-[#D99B63]" /> {rating.score}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">{activePlace.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{activePlace.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-[var(--bg-surface)] p-3">
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Starting Budget</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{inr(activePlace.dailyBudget)} / day</p>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface)] p-3">
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{MONTHS_SHORT[selectedMonth]} Weather</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{weather.emoji} {weather.tempRange}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/destination/${activePlace.id}`} className="btn-primary flex-1 !py-2.5 text-xs">
                Explore More <ArrowRight size={15} />
              </Link>
              <Link
                to="/planner"
                state={{ prefill: [activePlace.id], region: activePlace.zone }}
                className="btn-outline !py-2.5 text-xs"
              >
                Plan This Trip
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
