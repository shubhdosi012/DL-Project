const key = (name) => `bharatyatra:${name}`

export const getStored = (name, fallback) => {
  try { return JSON.parse(localStorage.getItem(key(name))) ?? fallback } catch { return fallback }
}
export const setStored = (name, value) => localStorage.setItem(key(name), JSON.stringify(value))

export const getFavorites = () => getStored('favorites', [])
export const toggleFavorite = (id) => {
  const current = getFavorites()
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  setStored('favorites', next)
  return next
}
export const getTrips = () => getStored('trips', [])
export const saveTrip = (trip) => {
  const trips = getTrips()
  const next = [{ ...trip, id: crypto.randomUUID(), savedAt: new Date().toISOString() }, ...trips]
  setStored('trips', next)
  return next
}
export const removeTrip = (id) => {
  const next = getTrips().filter((trip) => trip.id !== id)
  setStored('trips', next)
  return next
}
