import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { copy } from '../data/translations'
import {
  CARD_SHAPES,
  CAR_PAINTS,
  DEFAULT_THEME_CONFIG,
  TRAVELLER_THEMES,
} from '../data/themes'
import { getFavorites, getStored, getTrips, setStored } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('bharatyatra:language') || 'en')
  const [favorites, setFavorites] = useState(getFavorites)
  const [trips, setTrips] = useState(getTrips)
  const [userRatings, setUserRatings] = useState(() => getStored('ratings', {}))
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [user, setUser] = useState(() => getStored('user', null))
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [themeConfig, setThemeConfig] = useState(() => ({
    ...DEFAULT_THEME_CONFIG,
    ...getStored('theme', {}),
  }))
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const t = copy[language]

  useEffect(() => localStorage.setItem('bharatyatra:language', language), [language])
  useEffect(() => setStored('favorites', favorites), [favorites])
  useEffect(() => setStored('trips', trips), [trips])
  useEffect(() => setStored('ratings', userRatings), [userRatings])
  useEffect(() => setStored('user', user), [user])
  useEffect(() => setStored('theme', themeConfig), [themeConfig])

  useEffect(() => {
    const preset = TRAVELLER_THEMES[themeConfig.presetId] || TRAVELLER_THEMES['forest-beige']
    const carPaint = CAR_PAINTS.find((c) => c.id === themeConfig.carPaintId) || CAR_PAINTS[0]
    const cardShape = CARD_SHAPES.find((s) => s.id === themeConfig.cardShape) || CARD_SHAPES[0]
    const root = document.documentElement

    root.dataset.themeMode = preset.isDark ? 'dark' : 'light'
    root.dataset.themePreset = preset.id
    root.dataset.pattern = themeConfig.pattern
    root.dataset.fontMode = themeConfig.fontMode

    const vars = {
      '--bg-base': preset.bgBase,
      '--bg-surface': preset.bgSurface,
      '--bg-card-soft': preset.bgCardSoft,
      '--bg-header': preset.bgHeader,
      '--border-color': preset.borderColor,
      '--text-primary': preset.textPrimary,
      '--text-secondary': preset.textSecondary,
      '--text-muted': preset.textMuted,
      '--accent': themeConfig.accent || preset.accent,
      '--accent-2': themeConfig.accent2 || preset.accent2,
      '--hero-from': preset.heroFrom,
      '--hero-to': preset.heroTo,
      '--region-band-bg': preset.regionBandBg,
      '--region-band-border': preset.regionBandBorder,
      '--car-paint-1': carPaint.paint1 || preset.carPaint1,
      '--car-paint-2': carPaint.paint2 || preset.carPaint2,
      '--sun-1': preset.sunColor1,
      '--sun-2': preset.sunColor2,
      '--pattern-opacity': String(themeConfig.patternIntensity ?? 0.35),
      '--card-radius': cardShape.radius,
    }
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [themeConfig])

  const rateDestination = (placeId, data) => {
    setUserRatings((prev) => ({
      ...prev,
      [placeId]: { ...data, updatedAt: new Date().toISOString() },
    }))
  }

  const loginUser = ({ name, email }) => {
    setUser({ name: name || email.split('@')[0], email, signedInAt: new Date().toISOString() })
    setIsAuthOpen(false)
  }

  const logoutUser = () => setUser(null)

  const updateTheme = (patch) => setThemeConfig((prev) => ({ ...prev, ...patch }))
  const applyPreset = (presetId) => {
    const preset = TRAVELLER_THEMES[presetId]
    if (!preset) return
    setThemeConfig((prev) => ({
      ...prev,
      presetId: preset.id,
      accent: preset.accent,
      accent2: preset.accent2,
      pattern: preset.defaultPattern,
      routeId: preset.defaultRoute,
    }))
  }
  const resetTheme = () => setThemeConfig(DEFAULT_THEME_CONFIG)

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    favorites,
    setFavorites,
    trips,
    setTrips,
    userRatings,
    rateDestination,
    selectedMonth,
    setSelectedMonth,
    user,
    loginUser,
    logoutUser,
    isAuthOpen,
    setIsAuthOpen,
    isChatOpen,
    setIsChatOpen,
    themeConfig,
    updateTheme,
    applyPreset,
    resetTheme,
    isThemeOpen,
    setIsThemeOpen,
  }), [language, t, favorites, trips, userRatings, selectedMonth, user, isAuthOpen, isChatOpen, themeConfig, isThemeOpen])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
