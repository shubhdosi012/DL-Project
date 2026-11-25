import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ICONIC_ROUTES } from '../data/themes'

export function JourneyScene() {
  const { themeConfig, updateTheme } = useApp()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const routeIndex = Math.max(0, ICONIC_ROUTES.findIndex((r) => r.id === themeConfig.routeId))
  const activeRoute = ICONIC_ROUTES[routeIndex] || ICONIC_ROUTES[0]

  const cycleRoute = () => {
    const next = ICONIC_ROUTES[(routeIndex + 1) % ICONIC_ROUTES.length]
    updateTheme({ routeId: next.id })
  }

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8
    setTilt({ x, y })
  }

  return (
    <div
      className="journey-scene"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {/* Atmospheric glows */}
      <div className="scene-glow scene-glow-a" />
      <div className="scene-glow scene-glow-b" />

      {/* Twinkling stars */}
      <div className="scene-stars" aria-hidden="true">
        <div className="scene-star" /><div className="scene-star" /><div className="scene-star" />
        <div className="scene-star" /><div className="scene-star" /><div className="scene-star" />
      </div>

      {/* Animated Shooting Meteors */}
      <div className="scene-meteors" aria-hidden="true">
        <span className="scene-meteor meteor-1" />
        <span className="scene-meteor meteor-2" />
        <span className="scene-meteor meteor-3" />
      </div>

      {/* Sun / Moon with corona */}
      <div className="scene-sun" aria-hidden="true" />

      {/* Parallax mountains */}
      <div className="scene-mountain scene-mountain-back" aria-hidden="true" />
      <div className="scene-mountain scene-mountain-front" aria-hidden="true" />

      {/* Interactive route card — click to cycle iconic road trips */}
      <button
        type="button"
        onClick={cycleRoute}
        title="Click to switch road-trip route"
        className="scene-route-card pointer-events-auto cursor-pointer text-left transition-transform hover:scale-105"
      >
        <span>YOUR ROUTE • TAP TO SWITCH</span>
        <strong>{activeRoute.title}</strong>
        <i>{activeRoute.distance}</i>
      </button>

      {/* Road with animated dash lines */}
      <div className="scene-road" aria-hidden="true">
        <div className="road-line road-line-one" />
        <div className="road-line road-line-two" />
        <div className="road-line road-line-three" />
      </div>

      {/* 3D Animated Car with subtle mouse parallax */}
      <div
        className="scene-car"
        aria-hidden="true"
        style={{
          marginRight: `${-tilt.x * 1.1}px`,
          marginBottom: `${-tilt.y * 0.7}px`,
          transition: 'margin .25s ease-out',
        }}
      >
        <div className="speed-lines">
          <div className="speed-line" /><div className="speed-line" /><div className="speed-line" />
        </div>
        <div className="car-shadow" />
        <div className="car-body">
          <div className="car-roof"><i /><i /></div>
          <div className="car-window car-window-left" />
          <div className="car-window car-window-right" />
          <div className="car-light" />
          <div className="car-tail-light" />
          <div className="car-grille" />
          <div className="car-bumper" />
        </div>
        <div className="exhaust-container">
          <div className="exhaust-puff" /><div className="exhaust-puff" /><div className="exhaust-puff" />
        </div>
        <div className="car-wheel car-wheel-left"><i /></div>
        <div className="car-wheel car-wheel-right"><i /></div>
      </div>

      {/* 3D Animated Bullet / Meteor Cruiser Motorcycle */}
      <div
        className="scene-bike"
        aria-hidden="true"
        style={{
          marginRight: `${-tilt.x * 1.5}px`,
          marginBottom: `${-tilt.y * 0.9}px`,
          transition: 'margin .25s ease-out',
        }}
      >
        <div className="bike-shadow" />
        <div className="speed-lines bike-speed-lines">
          <div className="speed-line" /><div className="speed-line" />
        </div>
        <div className="bike-frame">
          <div className="bike-fender-rear" />
          <div className="bike-exhaust" />
          <div className="bike-engine" />
          <div className="bike-seat" />
          <div className="bike-tank" />
          <div className="bike-handlebar" />
          <div className="bike-fork" />
          <div className="bike-headlight" />
          <div className="bike-taillight" />
        </div>
        <div className="bike-exhaust-puffs">
          <div className="exhaust-puff" /><div className="exhaust-puff" />
        </div>
        <div className="bike-wheel bike-wheel-rear"><i /></div>
        <div className="bike-wheel bike-wheel-front"><i /></div>
      </div>

      {/* Animated map pins */}
      <div className="scene-pin scene-pin-one" aria-hidden="true"><span>✦</span></div>
      <div className="scene-pin scene-pin-two" aria-hidden="true"><span>✦</span></div>
    </div>
  )
}
