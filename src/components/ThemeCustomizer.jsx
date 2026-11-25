import { Car, Check, Compass, Palette, RotateCcw, Route, Sparkles, Type, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  ACCENT_SWATCHES,
  CARD_SHAPES,
  CAR_PAINTS,
  FONT_MODES,
  ICONIC_ROUTES,
  TRAVELLER_PATTERNS,
  TRAVELLER_THEMES,
} from '../data/themes'

export function ThemeCustomizer() {
  const {
    themeConfig,
    updateTheme,
    applyPreset,
    resetTheme,
    isThemeOpen,
    setIsThemeOpen,
    language,
  } = useApp()

  if (!isThemeOpen) return null

  const themes = Object.values(TRAVELLER_THEMES)
  const hindi = language === 'hi'

  return (
    <div className="theme-drawer-backdrop print:hidden" onClick={() => setIsThemeOpen(false)}>
      <aside
        className="theme-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Traveller Theme Customizer"
      >
        {/* Header */}
        <header className="theme-drawer-header">
          <div className="flex items-center gap-3">
            <span className="theme-drawer-badge">
              <Palette size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">
                {hindi ? 'ट्रैवलर थीम स्टूडियो' : 'Traveller Theme Studio'}
              </h2>
              <p className="text-xs opacity-75">
                {hindi ? 'अपना पूरा सफ़र अनुभव कस्टमाइज़ करें' : 'Customise your entire travel aesthetic live'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetTheme}
              title="Reset to default theme"
              className="theme-icon-btn"
              aria-label="Reset theme"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setIsThemeOpen(false)}
              className="theme-icon-btn"
              aria-label="Close theme customizer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="theme-drawer-body">
          {/* 1. Traveller Theme Presets */}
          <section>
            <SectionLabel icon={<Compass size={14} />} title={hindi ? 'यात्रा थीम चुनें' : 'Traveller Worlds'} />
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {themes.map((preset) => {
                const active = themeConfig.presetId === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`theme-preset-card ${active ? 'theme-preset-active' : ''}`}
                    style={{
                      background: preset.bgBase,
                      color: preset.textPrimary,
                      borderColor: active ? preset.accent : preset.borderColor,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{preset.emoji}</span>
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: preset.accent }} />
                        <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: preset.heroFrom }} />
                      </div>
                    </div>
                    <p className="mt-2 text-left text-xs font-extrabold leading-tight">
                      {hindi ? preset.hindi : preset.name}
                    </p>
                    <p className="mt-0.5 text-left text-[10px] leading-snug opacity-75">
                      {preset.tagline}
                    </p>
                    {active && (
                      <span
                        className="theme-preset-check"
                        style={{ background: preset.accent }}
                      >
                        <Check size={11} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* 2. Background Map Pattern */}
          <section>
            <SectionLabel icon={<Sparkles size={14} />} title={hindi ? 'बैकग्राउंड पैटर्न' : 'Traveller Backdrop Pattern'} />
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {TRAVELLER_PATTERNS.map((pat) => {
                const active = themeConfig.pattern === pat.id
                return (
                  <button
                    key={pat.id}
                    onClick={() => updateTheme({ pattern: pat.id })}
                    className={`theme-option-btn ${active ? 'theme-option-active' : ''}`}
                  >
                    <span className="block text-xs font-bold">{pat.name}</span>
                    <span className="block text-[10px] opacity-70">{pat.desc}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] px-3 py-2.5">
              <span className="text-xs font-bold">Pattern Visibility</span>
              <input
                type="range"
                min="0.15"
                max="1"
                step="0.05"
                value={themeConfig.patternIntensity}
                onChange={(e) => updateTheme({ patternIntensity: parseFloat(e.target.value) })}
                className="w-28 accent-[var(--accent)]"
              />
            </div>

            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-soft)] px-3 py-2.5">
              <div>
                <span className="block text-xs font-bold">Floating Map Motifs</span>
                <span className="block text-[10px] opacity-70">Compass, peaks & passport stamps</span>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.ambientMotifs}
                onChange={(e) => updateTheme({ ambientMotifs: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          </section>

          {/* 3. Accent Mood Color */}
          <section>
            <SectionLabel icon={<Palette size={14} />} title={hindi ? 'मुख्य रंग (Accent)' : 'Accent & Mood Color'} />
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {ACCENT_SWATCHES.map((swatch) => {
                const active = themeConfig.accent.toLowerCase() === swatch.accent.toLowerCase()
                return (
                  <button
                    key={swatch.id}
                    onClick={() => updateTheme({ accent: swatch.accent, accent2: swatch.accent2 })}
                    title={swatch.name}
                    className={`theme-swatch ${active ? 'theme-swatch-active' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${swatch.accent}, ${swatch.accent2})` }}
                  >
                    {active && <Check size={13} className="text-white" />}
                  </button>
                )
              })}
              <label
                title="Custom accent color"
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 text-[11px] font-bold"
              >
                <input
                  type="color"
                  value={themeConfig.accent}
                  onChange={(e) => updateTheme({ accent: e.target.value, accent2: e.target.value })}
                  className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                />
                Custom
              </label>
            </div>
          </section>

          {/* 4. 3D Road-Trip Car & Route */}
          <section>
            <SectionLabel icon={<Car size={14} />} title={hindi ? '3D कार और रूट' : '3D Road-Trip Car & Route'} />
            <div className="mt-2.5 flex flex-wrap gap-2">
              {CAR_PAINTS.map((car) => {
                const active = themeConfig.carPaintId === car.id
                return (
                  <button
                    key={car.id}
                    onClick={() => updateTheme({ carPaintId: car.id })}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--bg-card-soft)] text-[var(--accent)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${car.paint1}, ${car.paint2})` }}
                    />
                    {car.name}
                  </button>
                )
              })}
            </div>
            <div className="mt-2.5">
              <label className="mb-1 flex items-center gap-1.5 text-[11px] font-bold opacity-75">
                <Route size={12} /> Hero 3D Route Card
              </label>
              <select
                value={themeConfig.routeId}
                onChange={(e) => updateTheme({ routeId: e.target.value })}
                className="input !py-2 text-xs font-semibold"
              >
                {ICONIC_ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — {r.distance}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 5. Typography & Card Shape */}
          <section>
            <SectionLabel icon={<Type size={14} />} title={hindi ? 'फ़ॉन्ट और कार्ड स्टाइल' : 'Typography & Card Style'} />
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {FONT_MODES.map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateTheme({ fontMode: font.id })}
                  className={`theme-option-btn ${themeConfig.fontMode === font.id ? 'theme-option-active' : ''}`}
                >
                  <span className="block text-[11px] font-bold">{font.name}</span>
                  <span className="block text-[9px] opacity-70">{font.desc}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CARD_SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => updateTheme({ cardShape: shape.id })}
                  className={`theme-option-btn ${themeConfig.cardShape === shape.id ? 'theme-option-active' : ''}`}
                >
                  <span className="block text-[11px] font-bold">{shape.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent)]">
      {icon}
      <span>{title}</span>
    </div>
  )
}
