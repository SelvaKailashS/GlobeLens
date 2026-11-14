import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function SelectionHandler({ onSelect }) {
  useMapEvents({
    click: (event) => {
      onSelect?.({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function MapCenterController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || 6)
    }
  }, [center, zoom, map])
  return null
}

export default function TrendMap({ 
  points = [], 
  selected, 
  onSelect, 
  height = 420,
  center = [15.5, 78.5],
  zoom = 5 
}) {
  return (
    <div className="map-shell" style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterController center={center} zoom={zoom} />
        <SelectionHandler onSelect={onSelect} />

        {(points ?? []).map((point) => {
          const isSelected = point.id === selected || point.name?.toLowerCase() === String(selected)?.toLowerCase()
          const isDecreasing = String(point.trend || '').toLowerCase().includes('decreas')
          const isIncreasing = String(point.trend || '').toLowerCase().includes('increas')
          const markerColor = isDecreasing ? '#EF4444' : isIncreasing ? '#10B981' : '#00C9E8'

          return (
            <CircleMarker
              key={point.id || `${point.lat}-${point.lng}`}
              center={[point.lat, point.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? '#FFFFFF' : markerColor,
                fillColor: markerColor,
                fillOpacity: 0.85,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div style={{ color: '#071827', fontFamily: 'Inter, sans-serif', minWidth: '150px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#071827' }}>{point.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#566E85' }}>{point.region || 'Environmental Observation Station'}</div>
                  <div style={{ marginTop: '8px', borderTop: '1px solid #E1EAF0', paddingTop: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#0A1926' }}>
                      <strong>Trend: </strong>
                      <span style={{ color: markerColor, fontWeight: 600 }}>{point.value || point.trend || 'Analysis Available'}</span>
                    </div>
                    {point.obsValue && (
                      <div style={{ fontSize: '10px', color: '#566E85', marginTop: '2px' }}>
                        Obs: {point.obsValue}
                      </div>
                    )}
                    <div style={{ fontSize: '9px', color: '#889BAE', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>
                      {point.significance || 'NASA POWER MERRA-2'}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="map-overlay-label">
        <span className="status-dot cyan" />
        <span>NASA GEOSPATIAL OBSERVATION GRID</span>
      </div>
    </div>
  )
}
