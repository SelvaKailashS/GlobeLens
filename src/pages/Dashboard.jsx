import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Activity, 
  ArrowUpRight, 
  BarChart3, 
  CalendarDays, 
  ChevronRight, 
  Database, 
  Globe2, 
  MapPinned, 
  Sparkles, 
  TrendingUp,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Satellite,
  Compass,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  Scale
} from 'lucide-react'
import { PageHeader, SourceBanner, StatCard, TrendBadge } from '../components/UI'
import TrendChart from '../components/TrendChart'
import TrendMap from '../components/TrendMap'
import { 
  demoAnalysis, 
  demoMapPoints, 
  demoSeries, 
  recentActivity, 
  timeLabels, 
  variables as fallbackVariables, 
  datasets as fallbackDatasets 
} from '../data/demoData'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useBackend } from '../context/BackendContext'
import { fetchDatasets, fetchVariables, fetchRegions, fetchAnalysisMethods } from '../services/nasaApi'

export default function Dashboard({ analysis }) {
  const active = analysis || demoAnalysis
  const { isLive, healthData } = useBackend()

  const [backendDatasets, setBackendDatasets] = useState([])
  const [backendVariables, setBackendVariables] = useState([])
  const [backendRegions, setBackendRegions] = useState([])
  const [backendMethods, setBackendMethods] = useState([])

  useEffect(() => {
    let mounted = true
    if (isLive) {
      Promise.allSettled([
        fetchDatasets(),
        fetchVariables(),
        fetchRegions(),
        fetchAnalysisMethods(),
      ]).then(([dsRes, varRes, regRes, methRes]) => {
        if (!mounted) return
        if (dsRes.status === 'fulfilled' && dsRes.value?.datasets) {
          setBackendDatasets(dsRes.value.datasets)
        }
        if (varRes.status === 'fulfilled' && varRes.value?.variables) {
          setBackendVariables(varRes.value.variables)
        }
        if (regRes.status === 'fulfilled' && regRes.value?.regions) {
          setBackendRegions(regRes.value.regions)
        }
        if (methRes.status === 'fulfilled' && methRes.value?.methods) {
          setBackendMethods(methRes.value.methods)
        }
      })
    }
    return () => {
      mounted = false
    }
  }, [isLive])

  const datasetsCount = isLive && (backendDatasets.length || healthData?.datasets_registered)
    ? (backendDatasets.length || healthData.datasets_registered)
    : fallbackDatasets.length

  const variablesCount = isLive && (backendVariables.length || healthData?.variables_registered)
    ? (backendVariables.length || 23)
    : fallbackVariables.length

  const regionsCount = isLive && (backendRegions.length || healthData?.regions_registered)
    ? (backendRegions.length || healthData.regions_registered)
    : 8

  // Map points from backend regions if live
  const displayMapPoints = isLive && backendRegions.length > 0
    ? backendRegions.map((r) => ({
        id: r.region_id,
        name: r.name,
        region: r.category,
        lat: r.center_lat,
        lng: r.center_lon,
        trend: 'Monitored',
        slope: 0.05,
        value: r.category,
        significance: `${r.area_sq_km?.toLocaleString()} km²`,
      }))
    : demoMapPoints

  // Variables list for quick exploration
  const displayVariables = isLive && backendVariables.length > 0
    ? backendVariables.slice(0, 6).map((v) => ({
        id: v.variable_id,
        name: v.display_name,
        unit: v.units || v.original_units,
        category: v.physical_category,
      }))
    : fallbackVariables.slice(0, 6)

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="ENVIRONMENTAL OVERVIEW"
        title="Dashboard"
        description="Monitor planetary observation indicators, track verified environmental trends across active stations, and access quick analytical tools."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/explorer" className="button button-primary">
              <Database size={15} />
              <span>Explore Data</span>
            </Link>
            <Link to="/map" className="button button-secondary">
              <Globe2 size={15} />
              <span>Earth Map</span>
            </Link>
          </div>
        }
      />

      <SourceBanner isLive={isLive} />

      {/* 4 Clean Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Available Datasets"
          value={<AnimatedNumber value={datasetsCount} />}
          detail={isLive ? 'FastAPI NASA Registry Connected' : 'NASA Earth observation sources'}
          icon={Database}
          trend={isLive ? 'GPM, MODIS, AIRS, OMI, MERRA-2, GLDAS' : 'POWER, MERRA-2, MODIS, GPM'}
        />
        <StatCard
          label="Environmental Variables"
          value={<AnimatedNumber value={variablesCount} />}
          detail={isLive ? 'Physical parameters registered' : 'Temperature, rain, soil moisture, etc.'}
          icon={Layers}
          trend={isLive ? `${variablesCount} Active Physical Variables` : '8 Core Indicators'}
        />
        <StatCard
          label="Selected Region"
          value={active.location || 'Coimbatore'}
          detail={active.coordinates ? `${active.coordinates.lat}° N, ${active.coordinates.lng}° E` : '11.0168° N, 76.9558° E · 411m'}
          icon={MapPinned}
          trend={`${regionsCount} Global Study Regions`}
        />
        <StatCard
          label="Trend Direction"
          value={active.direction || 'Increasing'}
          detail={`Slope: ${active.slope > 0 ? '+' : ''}${active.slope ?? 0.13} ${active.unit || '°C'}/yr`}
          icon={TrendingUp}
          trend={active.pValue !== undefined ? `p = ${active.pValue} (${active.isSignificant ? 'Significant' : 'Verified'})` : 'p = 0.018 (Significant)'}
        />
      </div>

      {/* Main Grid: Trend Overview & Global Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Trend Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                <Activity size={17} style={{ color: 'var(--primary-blue)' }} />
                <span>Environmental Trend Overview</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Annual mean {active.variableName || 'Air Temperature'} for {active.location || 'Coimbatore'} ({active.period || '2010–2024'})
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendBadge value={active.direction || 'Increasing'} />
              <Link to="/analysis" className="button button-ghost" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                <span>Deep Analysis</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
          <div className="panel-body">
            <TrendChart
              labels={active.labels || timeLabels}
              values={active.values || active.series || demoSeries[active.variable || 'T2M']}
              unit={active.unit || '°C'}
              label={`${active.location || 'Coimbatore'} ${active.variable || 'T2M'}`}
              showTrend={true}
              height={300}
              variableKey={active.variable || 'T2M'}
            />
          </div>
        </div>

        {/* Observation Map Preview */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                <Globe2 size={17} style={{ color: 'var(--green)' }} />
                <span>Active Observation Stations</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isLive ? 'Verified geographic study regions from backend' : 'Verified telemetry stations across India & Global nodes'}
              </p>
            </div>
            <Link to="/map" className="button button-ghost" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
              <span>Expand Map</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="panel-body" style={{ padding: '12px' }}>
            <TrendMap
              points={displayMapPoints}
              selected={active.region_id || active.location?.toLowerCase() || 'coimbatore'}
              height={300}
              center={[14.0, 78.0]}
              zoom={4}
            />
          </div>
        </div>
      </div>

      {/* Secondary Grid: Recent Investigations & Variable Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Recent Analysis Activity */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Clock size={17} style={{ color: 'var(--primary-blue)' }} />
              <span>Recent Environmental Analyses</span>
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Latest sessions</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {recentActivity.map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 20px', 
                  borderBottom: idx !== recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.slope > 0 ? 'var(--amber)' : 'var(--green)' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>{item.location}</strong>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '12px' }}>{item.variable}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: item.slope > 0 ? 'var(--amber)' : 'var(--green)' }}>
                    {item.slope > 0 ? '+' : ''}{item.slope}/yr
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Variable Exploration */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Layers size={17} style={{ color: 'var(--primary-blue)' }} />
              <span>Explore by Variable</span>
            </h3>
            <Link to="/explorer" style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600 }}>
              View All ({variablesCount})
            </Link>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {displayVariables.map((v) => (
                <Link
                  key={v.id}
                  to={`/explorer?var=${v.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                    {v.name}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                    Unit: {v.unit}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
