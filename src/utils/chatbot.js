import destinations from '../data/destinations.json'
import { generateItinerary, getRecommendations, inr } from './planner'
import { MONTHS_FULL, rankDestinationsByMonth } from './ratings'

const categoryTerms = {
  Heritage: ['heritage', 'fort', 'history', 'palace', 'monument', 'ancient', 'ruins', 'temple', 'mosque', 'colonial', 'mughal', 'rajput', 'किला', 'इतिहास', 'महल', 'स्मारक', 'विरासत'],
  Nature: ['nature', 'mountain', 'hill', 'scenic', 'waterfall', 'forest', 'valley', 'lake', 'river', 'green', 'trek', 'hiking', 'प्रकृति', 'पहाड़', 'झरना', 'जंगल', 'झील', 'नदी', 'घाटी'],
  Beach: ['beach', 'island', 'sea', 'coast', 'beaches', 'ocean', 'scuba', 'diving', 'snorkeling', 'coral', 'lagoon', 'समुद्र', 'बीच', 'द्वीप', 'तट'],
  Spiritual: ['spiritual', 'temple', 'pilgrimage', 'meditation', 'religious', 'yoga', 'ashram', 'prayer', 'sacred', 'holy', 'दर्शन', 'मंदिर', 'आध्यात्मिक', 'तीर्थ', 'योग', 'आश्रम'],
  Wildlife: ['wildlife', 'safari', 'tiger', 'animal', 'bird', 'birdwatching', 'national park', 'sanctuary', 'rhino', 'elephant', 'leopard', 'वन्यजीव', 'टाइगर', 'सफारी', 'चिड़िया'],
  Adventure: ['adventure', 'trek', 'rafting', 'ski', 'hike', 'adrenaline', 'paragliding', 'camping', 'climbing', 'extreme', 'bungee', 'रोमांच', 'ट्रेक', 'राफ्टिंग', 'कैम्पिंग'],
  City: ['city', 'urban', 'market', 'shopping', 'city break', 'nightlife', 'street', 'metro', 'शहर', 'बाज़ार', 'मार्केट'],
  Food: ['food', 'eat', 'cuisine', 'restaurant', 'biryani', 'street food', 'thali', 'spice', 'culinary', 'foodie', 'taste', 'खाना', 'भोजन', 'फूड', 'बिरयानी', 'थाली'],
}

const regionTerms = {
  North: ['north', 'himachal', 'kashmir', 'uttarakhand', 'ladakh', 'rajasthan', 'punjab', 'haryana', 'delhi', 'uttar pradesh', 'उत्तर', 'हिमाचल', 'कश्मीर', 'राजस्थान'],
  South: ['south', 'kerala', 'tamil', 'karnataka', 'andhra', 'telangana', 'pondicherry', 'puducherry', 'दक्षिण', 'केरल', 'तमिल'],
  East: ['east', 'bengal', 'bihar', 'odisha', 'jharkhand', 'kolkata', 'पूर्व', 'बंगाल'],
  West: ['west', 'goa', 'rajasthan', 'gujarat', 'maharashtra', 'mumbai', 'पश्चिम', 'गोवा', 'गुजरात'],
  Central: ['central', 'madhya', 'chhattisgarh', 'मध्य', 'छत्तीसगढ़'],
  Northeast: ['northeast', 'north east', 'assam', 'meghalaya', 'sikkim', 'nagaland', 'manipur', 'mizoram', 'tripura', 'arunachal', 'अरुणाचल', 'पूर्वोत्तर', 'मेघालय', 'सिक्किम'],
  Islands: ['island', 'andaman', 'lakshadweep', 'havelock', 'द्वीप', 'अंडमान', 'लक्षद्वीप'],
}

const moodPresets = [
  { words: ['honeymoon', 'romantic', 'couple', 'हनीमून', 'कपल'], label: 'romantic getaway', ids: ['udaipur', 'munnar', 'srinagar', 'havelock'] },
  { words: ['family', 'parents', 'kids', 'परिवार', 'फैमिली'], label: 'family-friendly trip', ids: ['jaipur', 'mysuru', 'shimla', 'alleppey'] },
  { words: ['solo', 'backpack', 'hostel', 'सोलो', 'बैकपैक'], label: 'solo backpacker journey', ids: ['rishikesh', 'hampi', 'dharamshala', 'varanasi'] },
  { words: ['weekend', 'short', '2 day', '3 day', 'वीकेंड'], label: 'quick weekend escape', ids: ['mahabaleshwar', 'rishikesh', 'coorg', 'jaipur'] },
]

const has = (text, words) => words.some((word) => text.includes(word))

const intro = {
  en: "Namaste! 🙏 I'm YatraSathi — your smart India travel companion.\n\nAsk me about:\n🏔️ Destinations, seasons & mini itineraries\n💰 Budget-friendly routes\n⚖️ Comparing two places (e.g. Goa vs Udaipur)\n💑 Honeymoon, family, solo or weekend ideas",
  hi: "नमस्ते! 🙏 मैं यात्रा साथी हूँ — आपका स्मार्ट भारत ट्रैवल कम्पैनियन।\n\nमुझसे पूछें:\n🏔️ जगहें, मौसम और मिनी यात्रा कार्यक्रम\n💰 बजट-फ्रेंडली रास्ते\n⚖️ दो जगहों की तुलना (जैसे गोवा vs उदयपुर)\n💑 हनीमून, फैमिली, सोलो या वीकेंड आइडियाज़",
}

const prompts = {
  en: ['🏖️ Beach escapes', '⛰️ Mountain adventure', '🛕 Temple trail', '💰 Under ₹3,000/day', '🗺️ Plan a 5-day trip', '🎲 Surprise me'],
  hi: ['🏖️ समुद्र किनारे', '⛰️ पहाड़ी रोमांच', '🛕 मंदिर यात्रा', '💰 ₹3,000/दिन से कम', '🗺️ 5 दिन की ट्रिप', '🎲 सरप्राइज करें'],
}

export function getWelcome(language) {
  return { text: intro[language], places: [], actions: prompts[language] }
}

function findPlaceInText(fragment) {
  return (
    destinations.find((p) => fragment.includes(p.name.toLowerCase()) || fragment.includes(p.id.replaceAll('-', ' '))) ||
    destinations.find((p) => fragment.includes(p.state.toLowerCase()))
  )
}

function findComparison(text) {
  const vsPatterns = [' vs ', ' versus ', ' or ', ' ya ', ' और ', ' compare ']
  for (const sep of vsPatterns) {
    if (text.includes(sep)) {
      const parts = text.split(sep)
      if (parts.length === 2) {
        const a = findPlaceInText(parts[0])
        const b = findPlaceInText(parts[1])
        if (a && b && a.id !== b.id) return [a, b]
      }
    }
  }
  return null
}

const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const hindiMonths = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']

function findMonth(text) {
  for (let i = 0; i < monthNames.length; i++) {
    if (text.includes(monthNames[i]) || text.includes(monthNames[i].slice(0, 3)) || text.includes(hindiMonths[i])) return monthNames[i]
  }
  return null
}

function placesForMonth(month) {
  return destinations.filter((p) => p.bestTime.toLowerCase().includes(month) || p.bestTime.toLowerCase().includes(month.slice(0, 3))).slice(0, 4)
}

function randomPicks(n = 4) {
  return [...destinations].sort(() => Math.random() - 0.5).slice(0, n)
}

function parseDays(text) {
  const match = text.match(/(\d+)\s*(day|days|दिन|din)/)
  return match ? Math.min(14, Math.max(1, parseInt(match[1], 10))) : null
}

export function getChatResponse(input, language = 'en') {
  const text = input.toLowerCase().trim()
  const hindi = language === 'hi'
  if (!text) return { text: hindi ? 'अपना सवाल लिखिए — मैं मदद करूँगा। 😊' : "Type a question and I'll help you plan. 😊", places: [], actions: [] }

  if (has(text, ['hello', 'hi', 'namaste', 'hey', 'hola', 'sup', 'नमस्ते', 'हेलो', 'हाय'])) {
    return {
      text: hindi ? 'नमस्ते! 🙏 बताइए, आप कहाँ घूमना चाहते हैं? बीच, पहाड़, मंदिर, सफारी, या कुछ और?' : 'Namaste! 🙏 Where would you love to explore? Beaches, mountains, temple trails, safaris, or something unique?',
      places: [], actions: prompts[language],
    }
  }

  if (has(text, ['thank', 'thanks', 'dhanyavaad', 'shukriya', 'धन्यवाद', 'शुक्रिया'])) {
    return { text: hindi ? 'आपकी यात्रा शुभ हो! 🙏✨ और कुछ पूछना हो तो बताइए।' : "You're welcome! 🙏✨ Have a wonderful journey. Feel free to ask anything else!", places: [], actions: [] }
  }

  if (has(text, ['surprise', 'random', 'anything', 'kuch bhi', 'कुछ भी', 'सरप्राइज'])) {
    const picks = randomPicks(4)
    return {
      text: hindi ? '🎲 चलिए, कुछ अनोखा! ये रही आपके लिए कुछ शानदार जगहें:' : '🎲 Here are some handpicked gems for your next adventure:',
      places: picks, actions: [hindi ? '🎲 फिर से सरप्राइज' : '🎲 Surprise me again', 'Open planner'],
    }
  }

  const comparison = findComparison(text)
  if (comparison) {
    const [a, b] = comparison
    return {
      text: hindi
        ? `⚖️ ${a.name} vs ${b.name}:\n\n📍 ${a.name} — ${a.description}\n• ${a.idealDays} दिन, ~${inr(a.dailyBudget)}/दिन • बेस्ट: ${a.bestTime}\n\n📍 ${b.name} — ${b.description}\n• ${b.idealDays} दिन, ~${inr(b.dailyBudget)}/दिन • बेस्ट: ${b.bestTime}`
        : `⚖️ ${a.name} vs ${b.name}:\n\n📍 ${a.name} — ${a.description}\n• ${a.idealDays} days, ~${inr(a.dailyBudget)}/day • Best: ${a.bestTime}\n\n📍 ${b.name} — ${b.description}\n• ${b.idealDays} days, ~${inr(b.dailyBudget)}/day • Best: ${b.bestTime}`,
      places: comparison, actions: ['Plan a trip'],
    }
  }

  const directPlace = destinations.find((place) => text.includes(place.name.toLowerCase()) || text.includes(place.id.replaceAll('-', ' ')))
  const askedSeason = has(text, ['best time', 'when', 'season', 'weather', 'climate', 'monsoon', 'winter', 'summer', 'कब', 'मौसम', 'सही समय', 'बारिश', 'सर्दी', 'गर्मी'])
  const asksBudget = has(text, ['budget', 'cost', 'cheap', 'afford', '₹', 'rs', 'rupee', 'price', 'expensive', 'spend', 'under', '3000', '3,000', 'बजट', 'खर्च', 'सस्ता', 'महंगा', 'कीमत', 'कम'])
  const asksPlan = has(text, ['plan', 'itinerary', 'trip', 'route', 'journey', 'schedule', 'यात्रा', 'प्लान', 'कार्यक्रम', 'रूट'])
  const days = parseDays(text)

  if (directPlace) {
    if (asksPlan || days) {
      const tripDays = days || directPlace.idealDays
      const mini = generateItinerary([directPlace], Math.min(4, tripDays))
      const lines = mini.map((d) => `Day ${d.day}: ${d.highlights[1].replace('Afternoon: experience ', '')}`).join('\n')
      return {
        text: hindi
          ? `🗺️ ${directPlace.name} के लिए ${tripDays}-दिन का मिनी प्लान (~${inr(directPlace.dailyBudget * tripDays)} प्रति व्यक्ति):\n\n${lines}`
          : `🗺️ ${tripDays}-day mini plan for ${directPlace.name} (~${inr(directPlace.dailyBudget * tripDays)} per person):\n\n${lines}`,
        places: [directPlace], actions: ['Open planner', `Best time for ${directPlace.name}`],
      }
    }
    if (askedSeason) return {
      text: hindi
        ? `🌤️ ${directPlace.name} जाने का सबसे अच्छा समय ${directPlace.bestTime} है।\n\n⏱️ कम से कम ${directPlace.idealDays} दिन रखें।\n✨ खासियत: ${directPlace.highlights.join(', ')}`
        : `🌤️ The best time to visit ${directPlace.name} is ${directPlace.bestTime}.\n\n⏱️ Plan at least ${directPlace.idealDays} ${directPlace.idealDays === 1 ? 'day' : 'days'} here.\n✨ Highlights: ${directPlace.highlights.join(', ')}`,
      places: [directPlace], actions: ['Plan a trip'],
    }
    if (asksBudget) return {
      text: hindi
        ? `💰 ${directPlace.name} का बजट:\n• प्रति व्यक्ति/दिन: ~${inr(directPlace.dailyBudget)}\n• ${directPlace.idealDays} दिन का अनुमान: ~${inr(directPlace.dailyBudget * directPlace.idealDays)}\n\nइसमें रहना, खाना, स्थानीय यात्रा और गतिविधियाँ शामिल हैं।`
        : `💰 Budget for ${directPlace.name}:\n• Per person/day: ~${inr(directPlace.dailyBudget)}\n• ${directPlace.idealDays}-day estimate: ~${inr(directPlace.dailyBudget * directPlace.idealDays)}\n\nCovers stays, food, local travel & activities.`,
      places: [directPlace], actions: ['Plan a trip'],
    }
    return {
      text: hindi
        ? `📍 ${directPlace.name}, ${directPlace.state}\n\n${directPlace.description}\n\n✨ ${directPlace.highlights.join(' • ')}\n📅 बेस्ट: ${directPlace.bestTime}\n💰 ~${inr(directPlace.dailyBudget)}/दिन`
        : `📍 ${directPlace.name}, ${directPlace.state}\n\n${directPlace.description}\n\n✨ ${directPlace.highlights.join(' • ')}\n📅 Best: ${directPlace.bestTime}\n💰 ~${inr(directPlace.dailyBudget)}/day`,
      places: [directPlace], actions: ['Plan a trip', `Best time for ${directPlace.name}`],
    }
  }

  /* ── Travel mood presets (honeymoon, family, solo, weekend) ── */
  const mood = moodPresets.find((m) => has(text, m.words))
  if (mood) {
    const places = mood.ids.map((id) => destinations.find((p) => p.id === id)).filter(Boolean)
    return {
      text: hindi
        ? `✨ आपकी ${mood.label} के लिए ये चुनिंदा जगहें बेहतरीन हैं:`
        : `✨ Top curated destinations for a ${mood.label}:`,
      places, actions: ['Open planner', '🎲 Surprise me'],
    }
  }

  const month = findMonth(text)
  if (month) {
    const mIdx = monthNames.indexOf(month)
    const ranked = rankDestinationsByMonth(destinations, mIdx).slice(0, 4)
    if (ranked.length) return {
      text: hindi
        ? `📅 ${MONTHS_FULL[mIdx]} के मौसम के हिसाब से टॉप रैंक वाली जगहें:\n${ranked.map((p) => `#${p.rank} ${p.name} (${p.weather.emoji} ${p.weather.score}% • ★${p.rating.score})`).join('\n')}`
        : `📅 Top weather-ranked places for ${MONTHS_FULL[mIdx]}:\n${ranked.map((p) => `#${p.rank} ${p.name} (${p.weather.emoji} ${p.weather.score}% • ★${p.rating.score})`).join('\n')}`,
      places: ranked, actions: ['Open planner'],
    }
  }

  const interests = Object.entries(categoryTerms).filter(([, words]) => has(text, words)).map(([category]) => category)
  const region = Object.entries(regionTerms).find(([, words]) => has(text, words))?.[0] || 'All'
  const lowBudget = asksBudget && has(text, ['cheap', 'under', 'less', '3000', '3,000', 'low', 'सस्ता', 'कम', 'किफायती'])

  if (lowBudget) {
    const places = destinations.filter((place) => place.dailyBudget <= 3000 && (region === 'All' || place.zone === region)).sort((a, b) => a.dailyBudget - b.dailyBudget).slice(0, 4)
    return {
      text: hindi
        ? `💰 बजट-फ्रेंडली जगहें (₹3,000/दिन से कम):\n\nकम खर्च में भी यादगार यात्रा हो सकती है! ये जगहें शानदार अनुभव देती हैं।`
        : `💰 Budget-friendly picks (under ₹3,000/day):\n\nIncredible Indian journeys don't need a huge budget! These stops offer amazing value.`,
      places, actions: ['Open planner', '🎲 Surprise me'],
    }
  }

  if (interests.length || region !== 'All' || asksPlan || days) {
    const places = getRecommendations(destinations, {
      region,
      interests: interests.length ? interests : ['Nature', 'Heritage'],
      budget: 'comfort',
      days: days || (asksPlan ? 5 : 3),
    }).slice(0, 4)
    const feeling = interests.length ? interests.join(' + ').toLowerCase() : region === 'All' ? 'India travel' : `${region} India`
    return {
      text: hindi
        ? `🗺️ आपकी ${feeling} पसंद के लिए ये जगहें बेहतरीन हैं!\n\nकिसी भी कार्ड पर टैप करें या प्लानर में पूरा ट्रिप बनाएँ।`
        : `🗺️ Top matches for your ${feeling} mood!\n\nTap any destination card to explore, or open the planner to generate a full itinerary.`,
      places, actions: ['Open planner', '🎲 Surprise me'],
    }
  }

  if (has(text, ['how many', 'total', 'count', 'number', 'kitni', 'कितनी', 'कुल'])) {
    const stateCount = new Set(destinations.map((p) => p.state)).size
    return {
      text: hindi
        ? `📊 BharatYatra में कुल ${destinations.length} जगहें हैं, ${stateCount} राज्यों/प्रदेशों से।`
        : `📊 BharatYatra features ${destinations.length} curated destinations across ${stateCount} states & Union Territories.`,
      places: [], actions: prompts[language],
    }
  }

  return {
    text: hindi
      ? '🤔 मैं आपकी भारत यात्रा में मदद कर सकता हूँ!\n\nऐसे पूछें:\n• "केरल में बीच"\n• "₹3,000/दिन से कम"\n• "मनाली कब जाएँ"\n• "5 दिन की ट्रिप"\n• "गोवा vs उदयपुर"'
      : '🤔 I can help shape your India journey!\n\nTry asking:\n• "Beaches in Kerala"\n• "Under ₹3,000/day"\n• "Best time for Manali"\n• "Plan a 5-day trip"\n• "Goa vs Udaipur"',
    places: [], actions: prompts[language],
  }
}
