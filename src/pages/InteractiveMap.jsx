import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowUpRight, 
  Globe2, 
  Layers3, 
  MapPin, 
  Search,
  Compass,
  ArrowRight,
  Database,
  LineChart,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Layers
} from 'lucide-react'
import { fetchRegions, fetchVariables, fetchDatasets } from '../services/nasaApi'
import TrendMap from '../components/TrendMap'
import { PageHeader, SourceBanner, TrendBadge } from '../components/UI'
import { demoMapPoints, variables as fallbackVariables, datasets as fallbackDatasets, getVariable } from '../data/demoData'
import { useBackend } from '../context/BackendContext'

export default function InteractiveMap({ onSelectLocation }) {
  const navigate = useNavigate()
  const [mapPoints, setMapPoints] = useState(demoMapPoints)
  const [rawRegions, setRawRegions] = useState([])
  const [selectedPoint, setSelectedPoint] = useState(demoMapPoints[0])
  const [selectedVariable, setSelectedVariable] = useState('precipitation')
  const [selectedDataset, setSelectedDataset] = useState('gpm_imerg')
  const [trendFilter, setTrendFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [variablesList, setVariablesList] = useState(fallbackVariables)
  const [datasetsList, setDatasetsList] = useState(fallbackDatasets)
  
  const { isLive } = useBackend()

  useEffect(() => {
    let active = true
    if (isLive) {
      Promise.allSettled([
        fetchRegions(),
        fetchVariables(),
        fetchDatasets()
      ]).then(([regRes, varRes, dsRes]) => {
        if (!active) return

        if (regRes.status === 'fulfilled' && regRes.value?.regions?.length) {
          const regions = regRes.value.regions
          setRawRegions(regions)
          const formattedPoints = regions.map((r) => ({
            id: r.region_id,
            name: r.name,
            region: r.category,
            lat: r.center_lat,
            lng: r.center_lon,
            trend: 'Monitored Region',
            slope: 0.05,
            value: r.category,
            significance: `${r.area_sq_km ? r.area_sq_km.toLocaleString() + ' km²' : 'Curated Study Area'}`,
            bbox: r.bounding_box,
            description: r.description,
            climate_context: r.climate_context,
            target_phenomena: r.target_phenomena,
          }))
          setMapPoints(formattedPoints)
          if (formattedPoints[0]) {
            setSelectedPoint(formattedPoints[0])
          }
        }

        if (varRes.status === 'fulfilled' && varRes.value?.variables?.length) {
          setVariablesList(varRes.value.variables.map((v) => ({
            id: v.variable_id,
            name: v.display_name,
            unit: v.units || v.original_units,
          })))
        }

        if (dsRes.status === 'fulfilled' && dsRes.value?.datasets?.length) {
          setDatasetsList(dsRes.value.datasets.map((d) => ({
            id: d.dataset_id,
            name: d.display_name,
          })))
        }
      })
    }
    return () => {
      active = false
    }
  }, [isLive])

  // Accessible filter for search and trend
  const filteredPoints = (mapPoints ?? []).filter((point) => {
    const matchesSearch = point.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          point.region?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (trendFilter === 'increasing') return String(point.trend || '').toLowerCase().includes('increas')
    if (trendFilter === 'decreasing') return String(point.trend || '').toLowerCase().includes('decreas')
    return true
  })

  const currentVar = variablesList.find((v) => v.id === selectedVariable) || getVariable(selectedVariable) || { name: selectedVariable, unit: 'units' }

  function handleSelectPoint(pt) {
    setSelectedPoint(pt)
    onSelectLocation?.(pt)
  }

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="GEOSPATIAL VISUALIZATION"
        title="Earth Map"
        description="Explore environmental changes across verified observation stations and global study regions on an interactive world map. Search locations, switch layers, and inspect regional metadata."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/explorer" className="button button-secondary">
              <Database size={14} />
              <span>Explore Data</span>
            </Link>
            <Link to="/analysis" className="button button-primary">
              <LineChart size={14} />
              <span>Start Analysis</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        }
      />

      <SourceBanner isLive={isLive} />

      {/* Map Filter Controls Bar */}
      <div className="panel" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Variable & Dataset Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="map-var" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Variable:</label>
              <select
                id="map-var"
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="select"
                style={{ width: '180px', padding: '6px 10px', fontSize: '13px' }}
              >
                {(variablesList ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="map-ds" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Dataset:</label>
              <select
                id="map-ds"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="select"
                style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
              >
                {(datasetsList ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Location & Trend Direction Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search region or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '32px', fontSize: '12.5px', padding: '5px 10px 5px 32px' }}
                aria-label="Search region or city"
              />
            </div>

            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value)}
              className="select"
              style={{ width: '150px', fontSize: '12.5px', padding: '5px 10px' }}
              aria-label="Filter by trend direction"
            >
              <option value="all">All Study Regions</option>
              <option value="increasing">Increasing / Warming</option>
              <option value="decreasing">Decreasing / Cooling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Station Information Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Leaflet Interactive Map */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Globe2 size={17} style={{ color: 'var(--primary-blue)' }} />
              <span>Geographical Map ({currentVar.name})</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {filteredPoints.length} Supported Regions
            </span>
          </div>
          <div className="panel-body" style={{ padding: '12px' }}>
            <TrendMap
              points={filteredPoints}
              selected={selectedPoint?.id || selectedPoint?.name?.toLowerCase()}
              onSelect={(coords) => {
                const matched = filteredPoints.find((p) => Math.abs(p.lat - coords.lat) < 1.0 && Math.abs(p.lng - coords.lng) < 1.0)
                if (matched) handleSelectPoint(matched)
              }}
              height={480}
              center={[selectedPoint?.lat || 11.0, selectedPoint?.lng || 77.0]}
              zoom={selectedPoint?.lat !== undefined ? 4 : 3}
            />

            {/* Accessible Map Legend */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>Legend:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                Warm / Arid / Continental
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Tropical / Marine / Cryospheric
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--primary-blue)', display: 'inline-block' }} />
                Selected Study Region
              </span>
            </div>
          </div>
        </div>

        {/* Selected Station Information Dossier */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <MapPin size={17} style={{ color: 'var(--green)' }} />
              <span>Selected Region Information</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>
              Scientific Dossier
            </span>
          </div>

          <div className="panel-body">
            {selectedPoint ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {selectedPoint.name}
                    </h2>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Category: <strong>{selectedPoint.region || 'Ecological Biome'}</strong>
                    </span>
                  </div>
                  <TrendBadge value={selectedPoint.trend || 'Monitored'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Centroid</span>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>
                      {selectedPoint.lat}° N, {selectedPoint.lng}° E
                    </strong>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Spatial Extent</span>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--primary-blue)', marginTop: '2px' }}>
                      {selectedPoint.significance || 'Bounding Box Bounded'}
                    </strong>
                  </div>
                </div>

                {/* Bounding box display if available */}
                {selectedPoint.bbox && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '12px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Bounding Box (WGS84)
                    </span>
                    <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      Lat: [{selectedPoint.bbox.min_lat}°, {selectedPoint.bbox.max_lat}°] · Lon: [{selectedPoint.bbox.min_lon}°, {selectedPoint.bbox.max_lon}°]
                    </span>
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Climatic Context & Phenomona
                  </h4>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    <p style={{ marginBottom: '6px' }}>
                      • <strong>Description:</strong> {selectedPoint.description || 'NASA observation study region.'}
                    </p>
                    {selectedPoint.climate_context && (
                      <p style={{ marginBottom: '6px' }}>
                        • <strong>Climate Context:</strong> {selectedPoint.climate_context}
                      </p>
                    )}
                    {selectedPoint.target_phenomena && (
                      <p>
                        • <strong>Target Phenomena:</strong> {selectedPoint.target_phenomena}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/explorer?location=${selectedPoint.id}&var=${selectedVariable}`}
                    className="button button-primary"
                    style={{ flex: 1 }}
                  >
                    <Database size={13} />
                    <span>Explore Data</span>
                  </Link>
                  <Link
                    to={`/compare?regionA=${selectedPoint.id}`}
                    className="button button-secondary"
                    style={{ flex: 1 }}
                  >
                    <LineChart size={13} />
                    <span>Compare Region</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <MapPin size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p>Click any point on the map to see regional information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
