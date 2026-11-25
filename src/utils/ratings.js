export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_INDEX = Object.fromEntries(MONTHS_FULL.map((m, i) => [m.toLowerCase(), i]))

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Parses `place.bestTime` strings like "October–March" or "March–June, September–October"
 * into a 12-element array where true means the month is in peak/recommended season.
 */
export function parseBestMonths(bestTime = '') {
  const active = Array(12).fill(false)
  const segments = bestTime.split(',').map((s) => s.trim()).filter(Boolean)

  for (const seg of segments) {
    const parts = seg.split(/–|-|to/i).map((p) => p.trim().toLowerCase())
    if (parts.length === 1) {
      const idx = MONTH_INDEX[parts[0]]
      if (idx !== undefined) active[idx] = true
      continue
    }
    const start = MONTH_INDEX[parts[0]]
    const end = MONTH_INDEX[parts[1]]
    if (start === undefined || end === undefined) continue
    let cur = start
    for (let guard = 0; guard < 12; guard += 1) {
      active[cur] = true
      if (cur === end) break
      cur = (cur + 1) % 12
    }
  }
  return active
}

function isShoulderMonth(bestMonths, monthIdx) {
  const prev = (monthIdx + 11) % 12
  const next = (monthIdx + 1) % 12
  return !bestMonths[monthIdx] && (bestMonths[prev] || bestMonths[next])
}

/**
 * Computes weather suitability (0-100), condition badge, and estimated temp
 * for any Indian destination in a given month (0 = Jan .. 11 = Dec).
 */
export function getWeatherProfile(place, monthIndex) {
  const bestMonths = parseBestMonths(place.bestTime)
  const inBest = bestMonths[monthIndex]
  const shoulder = isShoulderMonth(bestMonths, monthIndex)
  const h = hashStr(place.id)
  const cats = place.categories || []
  const isHighHimalaya = ['Ladakh', 'Jammu and Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Arunachal Pradesh'].includes(place.state)
  const isBeachOrIsland = cats.includes('Beach') || place.zone === 'Islands'
  const isMonsoonGem = /falls|valley of flowers|cherrapunji|dawki|munnar|coorg|alleppey/i.test(place.name)
  const isDesert = ['Jaisalmer', 'Rann of Kutch', 'Jaipur', 'Udaipur', 'Agra', 'Delhi'].some((n) => place.name.includes(n)) || place.state === 'Rajasthan'

  // Calculate base weather score
  let score = inBest ? 82 + (h % 9) : shoulder ? 58 + (h % 8) : 32 + (h % 12)

  // Boost peak seasonal alignment
  if (inBest && (monthIndex >= 9 || monthIndex <= 2) && !isHighHimalaya) score += 7 // Oct–Mar prime India
  if (inBest && isHighHimalaya && (monthIndex >= 3 && monthIndex <= 5 || monthIndex === 8 || monthIndex === 9)) score += 7
  if (inBest && isMonsoonGem && (monthIndex >= 6 && monthIndex <= 8)) score += 8
  if (isBeachOrIsland && (monthIndex >= 10 || monthIndex <= 2)) score += 5
  if (isDesert && (monthIndex >= 4 && monthIndex <= 6)) score -= 10
  if (isHighHimalaya && (monthIndex === 0 || monthIndex === 1) && !inBest) score -= 8

  score = Math.max(18, Math.min(99, score))

  // Determine temperature & condition label
  let tempMin = 18
  let tempMax = 28
  if (isHighHimalaya) {
    if (monthIndex === 11 || monthIndex <= 1) { tempMin = -4; tempMax = 8 }
    else if (monthIndex >= 2 && monthIndex <= 4) { tempMin = 8; tempMax = 20 }
    else if (monthIndex >= 5 && monthIndex <= 8) { tempMin = 14; tempMax = 24 }
    else { tempMin = 6; tempMax = 18 }
  } else if (isDesert) {
    if (monthIndex >= 3 && monthIndex <= 6) { tempMin = 28; tempMax = 43 }
    else if (monthIndex >= 10 || monthIndex <= 1) { tempMin = 10; tempMax = 24 }
    else { tempMin = 21; tempMax = 33 }
  } else if (isBeachOrIsland || place.zone === 'South') {
    if (monthIndex >= 5 && monthIndex <= 8) { tempMin = 23; tempMax = 30 }
    else if (monthIndex >= 10 || monthIndex <= 1) { tempMin = 21; tempMax = 30 }
    else { tempMin = 25; tempMax = 35 }
  } else {
    if (monthIndex >= 3 && monthIndex <= 5) { tempMin = 24; tempMax = 38 }
    else if (monthIndex >= 6 && monthIndex <= 8) { tempMin = 23; tempMax = 31 }
    else if (monthIndex >= 10 || monthIndex <= 1) { tempMin = 12; tempMax = 25 }
    else { tempMin = 19; tempMax = 30 }
  }
  const tempRange = `${tempMin}°–${tempMax}°C`

  let label = 'Pleasant'
  let emoji = '🌤️'
  let badgeClass = 'weather-good'

  if (score >= 86) {
    if (isHighHimalaya && (monthIndex <= 2 || monthIndex === 11)) {
      label = 'Snow Paradise'
      emoji = '❄️'
    } else if (monthIndex >= 6 && monthIndex <= 8 && isMonsoonGem) {
      label = 'Monsoon Magic'
      emoji = '🌧️'
    } else {
      label = 'Peak Weather'
      emoji = '☀️'
    }
    badgeClass = 'weather-peak'
  } else if (score >= 70) {
    label = monthIndex >= 6 && monthIndex <= 8 ? 'Lush Monsoon' : 'Great Season'
    emoji = monthIndex >= 6 && monthIndex <= 8 ? '🌦️' : '🌤️'
    badgeClass = 'weather-good'
  } else if (score >= 52) {
    label = 'Shoulder Season'
    emoji = '⛅'
    badgeClass = 'weather-shoulder'
  } else {
    label = isHighHimalaya ? 'Chilly / Closed' : monthIndex >= 6 && monthIndex <= 8 ? 'Heavy Rain' : 'Hot Off-Season'
    emoji = isHighHimalaya ? '🏔️' : monthIndex >= 6 && monthIndex <= 8 ? '🌧️' : '🔥'
    badgeClass = 'weather-off'
  }

  return {
    score,
    inBest,
    shoulder,
    label,
    emoji,
    badgeClass,
    tempRange,
    bestMonths,
  }
}

/**
 * Computes deterministic traveller rating + sub-scores + merged user review.
 */
export function getDestinationRating(place, userRatings = {}) {
  const h = hashStr(place.id)
  const baseScore = 4.3 + ((h % 65) / 100) // 4.30 .. 4.94
  const baseCount = 380 + (h % 2100)
  const userEntry = userRatings[place.id]

  const finalScore = userEntry?.stars
    ? Number(((baseScore * 12 + userEntry.stars) / 13).toFixed(1))
    : Number(baseScore.toFixed(1))

  const count = baseCount + (userEntry ? 1 : 0)

  const breakdown = {
    scenery: Math.min(5, Number((4.4 + ((h >> 2) % 6) / 10).toFixed(1))),
    culture: Math.min(5, Number((4.3 + ((h >> 4) % 7) / 10).toFixed(1))),
    value: Math.min(5, Number((place.dailyBudget <= 3200 ? 4.8 : 4.2 + ((h >> 6) % 6) / 10).toFixed(1))),
    comfort: Math.min(5, Number((4.2 + ((h >> 8) % 7) / 10).toFixed(1))),
  }

  return {
    score: finalScore,
    count,
    breakdown,
    userEntry: userEntry || null,
  }
}

/**
 * Ranks destinations for a given month using Weather Match (70%) + Rating (30%).
 */
export function rankDestinationsByMonth(destinations, monthIndex, userRatings = {}) {
  const enriched = destinations.map((place) => {
    const weather = getWeatherProfile(place, monthIndex)
    const rating = getDestinationRating(place, userRatings)
    const combinedScore = weather.score * 0.72 + (rating.score / 5) * 100 * 0.28
    return {
      ...place,
      weather,
      rating,
      combinedScore,
    }
  })

  enriched.sort((a, b) => b.combinedScore - a.combinedScore || b.rating.score - a.rating.score)

  return enriched.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }))
}
