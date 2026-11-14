import { useEffect, useRef } from 'react'

export default function EarthGlobe({ height = 480 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let rotation = 0

    // Coordinates of realistic continents and observation stations
    const stations = [
      { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, color: '#39BDE8', label: 'T2M +0.13°C/yr' },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, color: '#10B981', label: 'T2M +0.08°C/yr' },
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, color: '#39BDE8', label: 'GWETTOP -0.01' },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, color: '#F59E0B', label: 'RH2M -0.4%' },
      { name: 'Delhi', lat: 28.6139, lng: 77.2090, color: '#EF4444', label: 'T2M +0.17°C/yr' },
      { name: 'Nairobi', lat: -1.2921, lng: 36.8219, color: '#10B981', label: 'PRECT -0.02' },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#39BDE8', label: 'T2M +0.11°C/yr' },
      { name: 'London', lat: 51.5074, lng: -0.1278, color: '#39BDE8', label: 'T2M +0.09°C/yr' },
      { name: 'New York', lat: 40.7128, lng: -74.0060, color: '#F59E0B', label: 'T2M +0.14°C/yr' },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#EF4444', label: 'T2M +0.15°C/yr' },
    ]

    // Simplified polygon landmass patches (lat/lng pairs)
    const landmasses = [
      // India & South Asia
      [
        { lat: 8, lng: 77 }, { lat: 13, lng: 80 }, { lat: 20, lng: 86 }, { lat: 22, lng: 89 },
        { lat: 28, lng: 77 }, { lat: 34, lng: 74 }, { lat: 24, lng: 69 }, { lat: 19, lng: 73 }, { lat: 11, lng: 76 }
      ],
      // Africa
      [
        { lat: 35, lng: -5 }, { lat: 32, lng: 30 }, { lat: 12, lng: 43 }, { lat: -5, lng: 39 },
        { lat: -34, lng: 19 }, { lat: -22, lng: 14 }, { lat: 5, lng: 9 }, { lat: 15, lng: -17 }, { lat: 28, lng: -13 }
      ],
      // Europe
      [
        { lat: 36, lng: -9 }, { lat: 44, lng: 1 }, { lat: 55, lng: 10 }, { lat: 60, lng: 30 },
        { lat: 40, lng: 30 }, { lat: 38, lng: 24 }, { lat: 42, lng: 12 }, { lat: 43, lng: 4 }
      ],
      // East Asia
      [
        { lat: 22, lng: 114 }, { lat: 30, lng: 122 }, { lat: 40, lng: 124 }, { lat: 45, lng: 135 },
        { lat: 55, lng: 130 }, { lat: 50, lng: 90 }, { lat: 30, lng: 100 }, { lat: 20, lng: 105 }
      ],
      // Australia
      [
        { lat: -12, lng: 130 }, { lat: -15, lng: 145 }, { lat: -28, lng: 153 }, { lat: -38, lng: 145 },
        { lat: -35, lng: 115 }, { lat: -22, lng: 114 }
      ],
      // North America
      [
        { lat: 25, lng: -80 }, { lat: 35, lng: -75 }, { lat: 45, lng: -65 }, { lat: 60, lng: -80 },
        { lat: 65, lng: -140 }, { lat: 48, lng: -125 }, { lat: 30, lng: -115 }, { lat: 20, lng: -105 }
      ],
      // South America
      [
        { lat: 10, lng: -75 }, { lat: -5, lng: -35 }, { lat: -23, lng: -42 }, { lat: -45, lng: -65 },
        { lat: -55, lng: -68 }, { lat: -20, lng: -70 }, { lat: -5, lng: -80 }
      ]
    ]

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Spherical projection helper
    function project(lat, lng, radius, cx, cy, rot) {
      const radLat = (lat * Math.PI) / 180
      const radLng = ((lng + rot) * Math.PI) / 180

      // standard orthographic projection
      const x = radius * Math.cos(radLat) * Math.sin(radLng)
      const y = -radius * Math.sin(radLat)
      const z = radius * Math.cos(radLat) * Math.cos(radLng) // z > 0 means visible front

      return { x: cx + x, y: cy + y, z, visible: z > 0 }
    }

    let time = 0

    function render() {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.38

      ctx.clearRect(0, 0, width, height)

      // 1. Atmospheric Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.35)
      glowGrad.addColorStop(0, 'rgba(57, 189, 232, 0.28)')
      glowGrad.addColorStop(0.5, 'rgba(11, 92, 173, 0.15)')
      glowGrad.addColorStop(1, 'rgba(6, 20, 38, 0)')

      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2)
      ctx.fillStyle = glowGrad
      ctx.fill()

      // 2. Globe Body (Deep Space Ocean Gradient)
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius)
      oceanGrad.addColorStop(0, '#10375C')
      oceanGrad.addColorStop(0.45, '#0B2545')
      oceanGrad.addColorStop(0.85, '#06162B')
      oceanGrad.addColorStop(1, '#030B17')

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = oceanGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(57, 189, 232, 0.65)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.clip()

      // 3. Latitude & Longitude Coordinate Grid Lines
      ctx.lineWidth = 0.8
      ctx.strokeStyle = 'rgba(57, 189, 232, 0.18)'

      // Latitude circles (-60 to +60 in steps of 30)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let first = true
        for (let lng = -180; lng <= 180; lng += 5) {
          const p = project(lat, lng, radius, cx, cy, rotation)
          if (p.visible) {
            if (first) {
              ctx.moveTo(p.x, p.y)
              first = false
            } else {
              ctx.lineTo(p.x, p.y)
            }
          } else {
            first = true
          }
        }
        ctx.stroke()
      }

      // Longitude meridians (every 30 degrees)
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath()
        let first = true
        for (let lat = -85; lat <= 85; lat += 5) {
          const p = project(lat, lng, radius, cx, cy, rotation)
          if (p.visible) {
            if (first) {
              ctx.moveTo(p.x, p.y)
              first = false
            } else {
              ctx.lineTo(p.x, p.y)
            }
          } else {
            first = true
          }
        }
        ctx.stroke()
      }

      // 4. Render Continents
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)'
      ctx.lineWidth = 1

      landmasses.forEach((poly) => {
        ctx.beginPath()
        let visibleCount = 0
        poly.forEach((pt, i) => {
          const p = project(pt.lat, pt.lng, radius, cx, cy, rotation)
          if (p.visible) visibleCount++
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        if (visibleCount > 2) {
          ctx.fill()
          ctx.stroke()
        }
      })

      // 5. Day/Night Terminator Shadow
      const shadowGrad = ctx.createRadialGradient(cx + radius * 0.45, cy + radius * 0.4, radius * 0.2, cx, cy, radius)
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
      shadowGrad.addColorStop(0.7, 'rgba(2, 6, 14, 0.55)')
      shadowGrad.addColorStop(1, 'rgba(1, 4, 10, 0.88)')

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = shadowGrad
      ctx.fill()

      // 6. Observation Stations (Telemetry Markers)
      stations.forEach((st) => {
        const p = project(st.lat, st.lng, radius, cx, cy, rotation)
        if (p.visible) {
          // Pulse halo
          const pulse = (Math.sin(time * 3 + st.lat) + 1) / 2
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4 + pulse * 4, 0, Math.PI * 2)
          ctx.fillStyle = st.color + '44'
          ctx.fill()

          // Pin center
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = st.color
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1
          ctx.stroke()

          // Callout label
          if (p.z > radius * 0.35) {
            ctx.fillStyle = '#FFFFFF'
            ctx.font = '600 9.5px "DM Mono", monospace'
            ctx.fillText(st.name, p.x + 8, p.y - 2)

            ctx.fillStyle = st.color
            ctx.font = '500 8.5px "DM Mono", monospace'
            ctx.fillText(st.label, p.x + 8, p.y + 9)
          }
        }
      })

      ctx.restore() // End clipping to globe

      // 7. Satellite Orbital Rings & Moving Satellites
      // Orbit 1: Aqua/Terra polar trajectory
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 1.35, radius * 0.45, -0.4, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(57, 189, 232, 0.32)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([6, 6])
      ctx.stroke()

      // Moving Satellite 1 (Terra/MODIS)
      const sat1Angle = time * 0.8
      const sat1X = cx + Math.cos(sat1Angle) * (radius * 1.35) * Math.cos(-0.4) - Math.sin(sat1Angle) * (radius * 0.45) * Math.sin(-0.4)
      const sat1Y = cy + Math.cos(sat1Angle) * (radius * 1.35) * Math.sin(-0.4) + Math.sin(sat1Angle) * (radius * 0.45) * Math.cos(-0.4)

      // Satellite model & solar panels
      ctx.fillStyle = '#39BDE8'
      ctx.beginPath()
      ctx.arc(sat1X, sat1Y, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(sat1X - 7, sat1Y)
      ctx.lineTo(sat1X + 7, sat1Y)
      ctx.stroke()

      ctx.fillStyle = '#39BDE8'
      ctx.font = '600 8.5px "DM Mono", monospace'
      ctx.fillText('NASA TERRA / MODIS', sat1X + 10, sat1Y - 4)
      ctx.restore()

      // Orbit 2: GPM Core Observatory inclined trajectory
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius * 1.22, radius * 0.6, 0.65, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([4, 6])
      ctx.stroke()

      // Moving Satellite 2 (GPM)
      const sat2Angle = -time * 0.65 + 2
      const sat2X = cx + Math.cos(sat2Angle) * (radius * 1.22) * Math.cos(0.65) - Math.sin(sat2Angle) * (radius * 0.6) * Math.sin(0.65)
      const sat2Y = cy + Math.cos(sat2Angle) * (radius * 1.22) * Math.sin(0.65) + Math.sin(sat2Angle) * (radius * 0.6) * Math.cos(0.65)

      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      ctx.arc(sat2X, sat2Y, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(sat2X - 6, sat2Y - 2)
      ctx.lineTo(sat2X + 6, sat2Y + 2)
      ctx.stroke()

      ctx.fillStyle = '#10B981'
      ctx.font = '600 8.5px "DM Mono", monospace'
      ctx.fillText('GPM CORE OBS', sat2X + 10, sat2Y + 12)
      ctx.restore()

      // Advance rotation and time
      rotation += 0.35 // Continuous slow rotation
      time += 0.02
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, display: 'grid', placeItems: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

