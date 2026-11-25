import { CalendarDays, Check, ChevronDown, ChevronUp, Edit3, Heart, MapPinned, Printer, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import destinations from '../data/destinations.json'
import { DestinationCard } from '../components/DestinationCard'
import { useApp } from '../context/AppContext'
import { inr } from '../utils/planner'

export default function Saved() {
  const { favorites, trips, setTrips } = useApp()
  const liked = favorites.map((id) => destinations.find((place) => place.id === id)).filter(Boolean)

  const updateTrip = (id, patch) => {
    setTrips((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <p className="eyebrow" style={{ color: 'var(--accent)' }}>MY TRIPS DASHBOARD</p>
      <h1 className="page-title mt-2">Saved Trips & Favourites</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
        View your generated itineraries, edit trip details, check estimated budgets, or download plans as PDF — saved locally on your device.
      </p>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">My Saved Trips</h2>
          <span className="rounded-full bg-[var(--bg-card-soft)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">{trips.length}</span>
        </div>

        {trips.length ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onUpdate={(patch) => updateTrip(trip.id, patch)}
                onRemove={() => setTrips(trips.filter((item) => item.id !== trip.id))}
              />
            ))}
          </div>
        ) : (
          <Empty icon="✦" title="No saved trips yet" action="Plan a Trip with AI" to="/planner" />
        )}
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Favourite Destinations</h2>
          <span className="rounded-full bg-[var(--bg-card-soft)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">{liked.length}</span>
        </div>
        {liked.length ? (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liked.map((place) => <DestinationCard place={place} key={place.id} />)}
          </div>
        ) : (
          <Empty icon="♡" title="No favourite destinations yet" action="Explore Destinations" to="/explore" />
        )}
      </section>
    </section>
  )
}

function TripCard({ trip, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(trip.name)
  const [travelers, setTravelers] = useState(trip.preferences?.travelers || 2)
  const [notes, setNotes] = useState(trip.notes || '')

  const saveEdits = (e) => {
    e.preventDefault()
    onUpdate({
      name: name.trim() || trip.name,
      notes: notes.trim(),
      preferences: { ...trip.preferences, travelers: Number(travelers) || 1 },
    })
    setEditing(false)
  }

  return (
    <article className="themed-surface rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {trip.startingLocation ? `${trip.startingLocation} → ` : ''}Saved Itinerary
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-bold text-[var(--text-primary)]">{trip.name}</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Saved {new Date(trip.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {trip.departureDate ? ` · ${trip.departureDate} to ${trip.returnDate}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            title="Edit trip details"
            onClick={() => setEditing((v) => !v)}
            className="icon-button !h-9 !w-9"
          >
            <Edit3 size={15} />
          </button>
          <button
            title="Delete trip"
            onClick={onRemove}
            className="icon-button !h-9 !w-9 !text-rose-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={saveEdits} className="mt-4 space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] p-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-[var(--text-primary)]">Trip Title</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input !py-2 text-xs" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[var(--text-primary)]">Travellers</span>
              <input type="number" min="1" max="20" value={travelers} onChange={(e) => setTravelers(e.target.value)} className="input !py-2 text-xs" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-[var(--text-primary)]">Personal Notes</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Flight / hotel notes..." className="input !py-2 text-xs" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="btn-outline !py-1.5 text-xs">Cancel</button>
            <button type="submit" className="btn-primary !py-1.5 text-xs"><Check size={14} /> Save Changes</button>
          </div>
        </form>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Meta icon={<CalendarDays size={15} />} value={`${trip.preferences?.days || 3} days`} />
        <Meta icon={<Users size={15} />} value={`${trip.preferences?.travelers || 2} travellers`} />
        <Meta icon={<Heart size={15} />} value={inr(trip.budget?.total || 0)} />
      </div>

      {trip.notes && (
        <p className="mt-3 rounded-xl bg-[var(--bg-card-soft)] px-3.5 py-2 text-xs text-[var(--text-secondary)]">
          <strong>Note:</strong> {trip.notes}
        </p>
      )}

      <div className="mt-4 rounded-2xl bg-[var(--bg-card-soft)] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Destination Route</p>
        <p className="mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
          {(trip.selectedIds || []).map((id) => destinations.find((place) => place.id === id)?.name).filter(Boolean).join(' · ') || trip.name}
        </p>
      </div>

      {/* Expandable Saved Itinerary */}
      {trip.itinerary?.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] px-3.5 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card-soft)]"
          >
            <span>{expanded ? 'Hide Itinerary Schedule' : `Open Itinerary (${trip.itinerary.length} Days)`}</span>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2.5 border-l-2 border-[#B7C9A8] pl-3.5">
              {trip.itinerary.map((d) => (
                <div key={d.day} className="rounded-xl bg-[var(--bg-card-soft)] p-3 text-xs">
                  <p className="font-bold text-[var(--text-primary)]">Day {d.day}{d.dateLabel ? ` (${d.dateLabel})` : ''} — {d.phase || d.place}</p>
                  <p className="mt-1 text-[var(--text-secondary)]">{(d.activities || d.highlights || []).join(' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Link
          to="/planner"
          state={{ prefill: trip.selectedIds, region: trip.preferences?.region }}
          className="btn-outline flex-1 !py-2.5 text-xs"
        >
          <MapPinned size={14} /> Open in AI Planner
        </Link>
        <button className="icon-button" title="Download PDF / Print" onClick={() => window.print()}>
          <Printer size={16} />
        </button>
      </div>
    </article>
  )
}

function Meta({ icon, value }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card-soft)] p-3 text-center text-xs font-bold text-[var(--text-primary)]">
      <span className="mx-auto mb-1 block" style={{ color: 'var(--accent)' }}>{icon}</span>
      {value}
    </div>
  )
}

function Empty({ icon, title, action, to }) {
  return (
    <div className="themed-surface mt-5 rounded-3xl border-dashed p-10 text-center">
      <div className="text-4xl" style={{ color: 'var(--accent)' }}>{icon}</div>
      <h3 className="mt-3 font-display text-xl font-bold text-[var(--text-primary)]">{title}</h3>
      <Link to={to} className="btn-outline mt-5">{action}</Link>
    </div>
  )
}
