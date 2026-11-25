import { useApp } from '../context/AppContext'

/**
 * Clean, minimal Traveller Backdrop with subtle topographic map contours
 * and soft forest-sage atmospheric tint.
 */
export function TravellerBackdrop() {
  const { themeConfig } = useApp()
  const { pattern, patternIntensity } = themeConfig

  return (
    <div className="traveller-backdrop print:hidden" aria-hidden="true">
      <div className="traveller-atmo traveller-atmo-one" />
      <div className="traveller-atmo traveller-atmo-two" />

      {pattern !== 'minimal' && (
        <div
          className={`traveller-pattern traveller-pattern-${pattern === 'compass' ? 'compass' : 'topo'}`}
          style={{ opacity: Math.max(0.08, Math.min(0.85, patternIntensity ?? 0.35)) }}
        />
      )}

      <svg className="traveller-horizon" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,195 L180,130 L340,170 L540,95 L740,160 L960,85 L1180,155 L1340,115 L1440,145 L1440,220 L0,220 Z"
          fill="currentColor"
          opacity="0.03"
        />
      </svg>
    </div>
  )
}
