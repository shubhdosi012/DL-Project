export const budgetMultipliers = { backpacker: 0.72, comfort: 1, premium: 1.8 }

export function getRecommendations(destinations, preferences) {
  const { region, interests = [], budget = 'comfort', days = 5 } = preferences
  return destinations
    .map((place) => {
      let score = 0
      const reasons = []
      if (!region || region === 'All' || place.zone === region) { score += 3; reasons.push('matches your region') }
      const shared = place.categories.filter((item) => interests.includes(item))
      if (shared.length) { score += shared.length * 5; reasons.push(`great for ${shared.join(', ').toLowerCase()}`) }
      if (budget === 'backpacker' && place.dailyBudget <= 3200) { score += 2; reasons.push('fits a value-focused trip') }
      if (budget === 'premium' && place.dailyBudget >= 4500) { score += 1; reasons.push('has premium experiences') }
      if (days <= 3 && place.idealDays <= 2) score += 2
      if (days >= 6 && place.idealDays >= 3) score += 2
      return { ...place, score, reason: reasons.slice(0, 2).join(' • ') || 'a classic Indian journey' }
    })
    .sort((a, b) => b.score - a.score || a.dailyBudget - b.dailyBudget)
    .slice(0, 12)
}

export function generateItinerary(selected, days) {
  const plan = []
  if (!selected.length) return plan
  for (let day = 1; day <= days; day += 1) {
    const place = selected[(day - 1) % selected.length]
    const phase = day === 1 ? 'Arrival & orientation' : day === days ? 'A gentle farewell' : 'Deep discovery'
    const highlights = [
      `Morning: arrive at ${place.name} and settle into the local rhythm.`,
      `Afternoon: experience ${place.highlights[0]} and explore at an unhurried pace.`,
      `Evening: ${day === days ? 'shop for local keepsakes and plan your departure.' : `enjoy ${place.highlights[1] || 'a local meal and sunset walk'}.`}`,
    ]
    plan.push({ day, place: place.name, state: place.state, phase, highlights })
  }
  return plan
}

export function calculateBudget(selected, days, travelers, tier) {
  const average = selected.length
    ? selected.reduce((total, place) => total + place.dailyBudget, 0) / selected.length
    : 3500
  const daily = Math.round(average * (budgetMultipliers[tier] || 1))
  const stay = Math.round(daily * days * travelers * 0.42)
  const food = Math.round(daily * days * travelers * 0.24)
  const local = Math.round(daily * days * travelers * 0.20)
  const activities = Math.round(daily * days * travelers * 0.14)
  return { daily, stay, food, local, activities, total: stay + food + local + activities }
}

const STAY_BY_TIER = {
  budget: 'Clean boutique hostels, homestays, or cozy guesthouses near the center',
  mid: 'Well-rated 3-star heritage stays or scenic eco-resorts with breakfast',
  luxury: 'Curated luxury resorts, heritage havelis, or boutique retreats',
}

const FOOD_BY_PREF = {
  Solo: 'Local street-food walks, social cafés, and authentic regional thalis',
  Couple: 'Rooftop sunset dining, quiet courtyard cafés, and local specialties',
  Family: 'Spacious family restaurants with regional classics and gentle flavours',
  Friends: 'Lively markets, group platters, and popular local food alleys',
}

/**
 * Generates a full day-by-day timeline itinerary from BharatYatra AI Planner inputs.
 */
export function generateDetailedItinerary({
  startingLocation = 'New Delhi',
  place,
  departureDate,
  returnDate,
  travelers = 2,
  budgetPerPerson = 18000,
  preference = 'Couple',
  interests = ['Nature'],
}) {
  if (!place) return []
  const start = departureDate ? new Date(departureDate) : new Date()
  const end = returnDate ? new Date(returnDate) : new Date(start.getTime() + 3 * 86400000)
  const diffDays = Math.max(1, Math.min(14, Math.round((end - start) / 86400000) + 1))

  const budgetTier = budgetPerPerson / diffDays < 2800 ? 'budget' : budgetPerPerson / diffDays > 5500 ? 'luxury' : 'mid'
  const stayAdvice = STAY_BY_TIER[budgetTier]
  const foodAdvice = FOOD_BY_PREF[preference] || FOOD_BY_PREF.Couple
  const dailyPerPerson = Math.round(budgetPerPerson / diffDays)

  const plan = []
  for (let i = 0; i < diffDays; i += 1) {
    const dayNum = i + 1
    const d = new Date(start.getTime() + i * 86400000)
    const dateLabel = Number.isNaN(d.getTime())
      ? `Day ${dayNum}`
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    const isFirst = dayNum === 1
    const isLast = dayNum === diffDays
    const phase = isFirst
      ? `Arrival from ${startingLocation}`
      : isLast
      ? `Souvenirs & Return to ${startingLocation}`
      : `Explore ${place.name}`

    const attractions = isFirst
      ? [place.highlights[0] || `${place.name} Heritage Walk`, `${place.state} Scenic Viewpoint`]
      : isLast
      ? ['Morning Local Bazaar', place.highlights[1] || `${place.name} Sunrise Point`]
      : [place.highlights[dayNum % place.highlights.length] || place.name, `${place.categories[0]} Trail in ${place.name}`]

    const interestPick = interests[i % Math.max(1, interests.length)] || 'Nature'
    const activities = isFirst
      ? [
          `Travel from ${startingLocation} to ${place.name} and check into your stay.`,
          `Unwind with an evening orientation stroll tailored for a ${preference.toLowerCase()} trip.`,
        ]
      : isLast
      ? [
          `Enjoy a relaxed breakfast and pick up regional crafts or local spices.`,
          `Begin your return journey back to ${startingLocation}.`,
        ]
      : [
          `Morning ${interestPick.toLowerCase()} experience around ${attractions[0]}.`,
          `Afternoon guided exploration and golden-hour photography at ${attractions[1]}.`,
        ]

    const tips = [
      `Start early (around 7:30 AM) to enjoy ${attractions[0]} before midday crowds.`,
      `Best time for ${place.name} is ${place.bestTime}; keep digital & offline maps handy.`,
      `Try asking locals for hidden viewpoints and seasonal dishes in ${place.state}.`,
      `Carry cash alongside UPI for small local markets and heritage entry tickets.`,
    ]

    plan.push({
      day: dayNum,
      dateLabel,
      place: place.name,
      state: place.state,
      phase,
      attractions,
      activities,
      highlights: activities,
      food: foodAdvice,
      accommodation: stayAdvice,
      estimatedExpense: dailyPerPerson * travelers,
      tip: tips[i % tips.length],
    })
  }
  return plan
}

/**
 * Calculates visual 5-category budget breakdown for the BharatYatra Budget Dashboard.
 */
export function calculateDetailedBudget({ place, days = 4, travelers = 2, budgetPerPerson = 18000 }) {
  const perPerson = Math.max(3000, Math.round(budgetPerPerson || (place?.dailyBudget || 3500) * days))
  const total = perPerson * travelers
  const transport = Math.round(total * 0.26)
  const accommodation = Math.round(total * 0.34)
  const food = Math.round(total * 0.18)
  const activities = Math.round(total * 0.14)
  const other = Math.max(0, total - (transport + accommodation + food + activities))

  return {
    transport,
    accommodation,
    food,
    activities,
    other,
    total,
    perPerson,
    days,
    travelers,
  }
}

export const inr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
