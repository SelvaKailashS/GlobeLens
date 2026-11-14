import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Search, 
  SlidersHorizontal, 
  Database, 
  Download, 
  Layers, 
  MapPin, 
  LineChart, 
  AlertCircle,
  Table,
  Calendar,
  LoaderCircle,
  FileSearch,
  CheckCircle2,
  HardDrive
} from 'lucide-react'
import { 
  fetchDatasets, 
  fetchRegions, 
  fetchVariables, 
  previewData, 
  submitDataRetrieval, 
  pollJobUntilDone, 
  runTrendAnalysis 
} from '../services/nasaApi'
import { 
  demoAnalysis, 
  demoMapPoints, 
  getSeries, 
  getVariable, 
  locations as fallbackLocations, 
  variables as fallbackVariables, 
  datasets as fallbackDatasets, 
  timeLabels 
} from '../data/demoData'
import { ErrorState, LoadingState, PageHeader, SourceBanner } from '../components/UI'
import TrendChart from '../components/TrendChart'
import { useBackend } from '../context/BackendContext'

export default function DataExplorer({ onAnalysisReady }) {
  const navigate = useNavigate()
  const chartRef = useRef(null)
  const { isLive } = useBackend()

  // Dynamic state loaded from backend
  const [datasetsList, setDatasetsList] = useState(fallbackDatasets)
  const [regionsList, setRegionsList] = useState(fallbackLocations)
  const [variablesList, setVariablesList] = useState(fallbackVariables)

  const [form, setForm] = useState({ 
    dataset: 'gpm_imerg',
    variable: 'precipitation', 
    location: 'coimbatore', 
    start: '2020-01-01', 
    end: '2023-12-31', 
    customLat: '', 
    customLng: '' 
  })

  // Preview state from POST /api/data/preview
  const [previewInfo, setPreviewInfo] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Asynchronous job progress tracking
  const [jobProgress, setJobProgress] = useState({ active: false, status: '', percent: 0, message: '' })

  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [viewMode, setViewMode] = useState('chart') // 'chart' or 'table'
  
  const [activeObservations, setActiveObservations] = useState({
    labels: timeLabels,
    values: getSeries('T2M'),
    isLive: false,
    provenance: 'Calibrated demonstration baseline observations',
    unit: '°C',
    stats: {
      count: timeLabels.length,
      min: 25.0,
      max: 26.8,
      mean: 25.91,
      latest: 26.8
    }
  })

  // Load registered datasets, regions, and variables from FastAPI if available
  useEffect(() => {
    let active = true
    if (isLive) {
      Promise.allSettled([
        fetchDatasets(),
        fetchRegions(),
        fetchVariables(),
      ]).then(([dsRes, regRes, varRes]) => {
        if (!active) return

        if (dsRes.status === 'fulfilled' && dsRes.value?.datasets?.length) {
          const ds = dsRes.value.datasets.map((d) => ({
            id: d.dataset_id,
            name: d.display_name,
            shortName: d.short_name,
            mission: d.processing_level,
            resolution: d.spatial_resolution?.description || 'Global Grid',
            available_variables: d.available_variables || [],
          }))
          setDatasetsList(ds)
          // ensure initial form dataset matches
          if (!ds.some((item) => item.id === form.dataset)) {
            setForm((prev) => ({ ...prev, dataset: ds[0].id }))
          }
        }

        if (regRes.status === 'fulfilled' && regRes.value?.regions?.length) {
          const regs = regRes.value.regions.map((r) => ({
            id: r.region_id,
            name: r.name,
            region: r.category,
            lat: r.center_lat,
            lng: r.center_lon,
            bbox: r.bounding_box,
            description: r.description,
          }))
          setRegionsList(regs)
        }

        if (varRes.status === 'fulfilled' && varRes.value?.variables?.length) {
          const vars = varRes.value.variables.map((v) => ({
            id: v.variable_id,
            name: v.display_name,
            unit: v.units || v.original_units,
            category: v.physical_category,
            description: v.description,
            valid_range: v.valid_range,
          }))
          setVariablesList(vars)
        }
      })
    }
    return () => {
      active = false
    }
  }, [isLive])

  // Filter variables when dataset changes (if available)
  const availableVarsForDataset = datasetsList.find((d) => d.id === form.dataset)?.available_variables?.length
    ? datasetsList.find((d) => d.id === form.dataset).available_variables.map((v) => ({
        id: v.variable_id,
        name: v.display_name,
        unit: v.units || v.original_units,
        description: v.description,
      }))
    : variablesList

  // Update selected variable if not in dataset's available variables
  useEffect(() => {
    if (availableVarsForDataset.length > 0 && !availableVarsForDataset.some((v) => v.id === form.variable)) {
      setForm((prev) => ({ ...prev, variable: availableVarsForDataset[0].id }))
    }
  }, [form.dataset, availableVarsForDataset])

  const activeVariable = availableVarsForDataset.find((v) => v.id === form.variable) ||
    variablesList.find((v) => v.id === form.variable) ||
    variablesList[0] || { id: form.variable, name: form.variable, unit: 'units' }

  const activeDataset = datasetsList.find((d) => d.id === form.dataset) || datasetsList[0]
  const activeLocation = regionsList.find((item) => item.id === form.location) || regionsList[0]
  const isCustom = form.location === 'custom'

  function handleLocationSelect(locId) {
    if (locId === 'custom') {
      setForm((prev) => ({ ...prev, location: 'custom' }))
      return
    }
    const loc = regionsList.find((l) => l.id === locId)
    if (loc) {
      setForm((prev) => ({
        ...prev,
        location: locId,
        customLat: String(loc.lat),
        customLng: String(loc.lng)
      }))
    }
  }

  function handleClearFilters() {
    setForm({
      dataset: datasetsList[0]?.id || 'gpm_imerg',
      variable: 'precipitation',
      location: 'coimbatore',
      start: '2020-01-01',
      end: '2023-12-31',
      customLat: '',
      customLng: ''
    })
    setPreviewInfo(null)
    setStatus({ type: 'idle', message: '' })
  }

  // STEP: Preview NASA Data (POST /api/data/preview)
  async function handlePreviewNASAData() {
    if (!isLive) {
      setStatus({ type: 'info', message: 'Backend is offline. Please start FastAPI on port 8000 to preview live NASA granules.' })
      return
    }

    setPreviewLoading(true)
    setStatus({ type: 'loading', message: 'Querying NASA Common Metadata Repository (CMR) catalog for matching granules...' })

    const payload = {
      dataset_id: form.dataset,
      variable_id: form.variable,
      start_date: form.start,
      end_date: form.end,
    }

    if (isCustom && form.customLat && form.customLng) {
      const lat = parseFloat(form.customLat)
      const lng = parseFloat(form.customLng)
      payload.bounding_box = {
        min_lat: lat - 0.5,
        max_lat: lat + 0.5,
        min_lon: lng - 0.5,
        max_lon: lng + 0.5,
      }
    } else {
      payload.region_id = form.location
    }

    try {
      const preview = await previewData(payload)
      setPreviewInfo(preview)
      setStatus({ 
        type: 'success', 
        message: `Catalog search completed: Found ${preview.granules_found} granules (~${preview.estimated_size_mb} MB). Cached: ${preview.is_cached ? 'Yes' : 'No'}. Auth: ${preview.authentication_status?.method || 'unauthenticated'}.` 
      })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'NASA data preview failed.' })
    } finally {
      setPreviewLoading(false)
    }
  }

  // STEP: Submit Asynchronous Retrieval Job (POST /api/data/retrieve -> Polling)
  async function handleQueryData(e) {
    e?.preventDefault()
    if (!isLive) {
      // Fallback demo observations
      const demoVals = getSeries(form.variable) || [25.1, 25.4, 25.8, 26.2, 26.5]
      setActiveObservations({
        labels: timeLabels,
        values: demoVals,
        isLive: false,
        provenance: 'FastAPI Offline: Scientifically calibrated illustrative observations',
        unit: activeVariable.unit || 'units',
        stats: {
          count: demoVals.length,
          min: Math.min(...demoVals),
          max: Math.max(...demoVals),
          mean: +(demoVals.reduce((a, b) => a + b, 0) / demoVals.length).toFixed(2),
          latest: demoVals[demoVals.length - 1]
        }
      })
      setStatus({ type: 'info', message: 'FastAPI backend unavailable: Displaying illustrative NASA baseline demo series.' })
      return
    }

    setStatus({ type: 'loading', message: 'Submitting NASA asynchronous retrieval job...' })
    setJobProgress({ active: true, status: 'submitted', percent: 10, message: 'Job registered with backend queue...' })

    const payload = {
      dataset_id: form.dataset,
      variable_id: form.variable,
      start_date: form.start,
      end_date: form.end,
    }

    if (isCustom && form.customLat && form.customLng) {
      const lat = parseFloat(form.customLat)
      const lng = parseFloat(form.customLng)
      payload.bounding_box = {
        min_lat: lat - 0.5,
        max_lat: lat + 0.5,
        min_lon: lng - 0.5,
        max_lon: lng + 0.5,
      }
    } else {
      payload.region_id = form.location
    }

    try {
      const jobResp = await submitDataRetrieval(payload)
      const jobId = jobResp.job_id
      setJobProgress({ active: true, status: 'running', percent: 30, message: `Processing job ${jobId}...` })

      const { job, result } = await pollJobUntilDone(jobId, (currentJob) => {
        setJobProgress({
          active: true,
          status: currentJob.status,
          percent: currentJob.progress_percent || 50,
          message: currentJob.message || 'Retrieving and processing granules...',
        })
      })

      if (result && result.points && result.points.length > 0) {
        const validPoints = result.points.filter((p) => p.is_valid && p.value !== null)
        const lbls = validPoints.map((p) => p.timestamp?.slice(0, 10) || p.timestamp)
        const vals = validPoints.map((p) => p.value)
        const minVal = Math.min(...vals)
        const maxVal = Math.max(...vals)
        const meanVal = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4)

        setActiveObservations({
          labels: lbls,
          values: vals,
          isLive: true,
          provenance: result.provenance?.data_source || `NASA ${result.dataset_id} Retrieval`,
          unit: result.original_units || activeVariable.unit,
          points: result.points,
          jobId: jobId,
          stats: {
            count: vals.length,
            min: minVal,
            max: maxVal,
            mean: meanVal,
            latest: vals[vals.length - 1]
          }
        })
        setStatus({ type: 'success', message: `Retrieved ${vals.length} scientific observation points from backend.` })
      } else {
        throw new Error('Completed job returned an empty points array.')
      }
    } catch (err) {
      // If retrieval fails (e.g., NASA Earthdata requires token), explain clearly
      setStatus({ 
        type: 'error', 
        message: `Retrieval Note: ${err.message}. If NASA credentials are not configured, use the Compare workspace or run trend analysis on calibrated baselines.` 
      })
    } finally {
      setJobProgress({ active: false, status: '', percent: 0, message: '' })
    }
  }

  // STEP: Start Trend Analysis with the retrieved observations
  async function handleLaunchTrendAnalysis() {
    setStatus({ type: 'loading', message: 'Executing backend statistical trend analysis (POST /api/analysis/run)...' })
    
    const obsPoints = activeObservations.points || (
      activeObservations.values.map((v, i) => ({
        timestamp: `${activeObservations.labels[i] || '2020'}-01-01T00:00:00Z`,
        latitude: activeLocation?.lat || 11.0,
        longitude: activeLocation?.lng || 77.0,
        value: v,
        is_valid: true
      }))
    )

    const payload = {
      variable_id: form.variable,
      variable_name: activeVariable.name,
      region_id: form.location,
      region_name: isCustom ? 'Custom Coordinates' : activeLocation.name,
      original_units: activeObservations.unit || activeVariable.unit,
      alpha: 0.05,
      points: obsPoints
    }

    if (activeObservations.jobId) {
      payload.job_id = activeObservations.jobId
    }

    try {
      if (isLive) {
        const analysisResult = await runTrendAnalysis(payload)
        const analysisData = {
          variable: analysisResult.variable_id,
          variableName: activeVariable.name,
          location: isCustom ? 'Custom Location' : activeLocation.name,
          unit: analysisResult.original_units,
          period: `${analysisResult.time_range_start}–${analysisResult.time_range_end}`,
          direction: analysisResult.overall_trend_direction,
          slope: analysisResult.sens_slope?.slope || analysisResult.linear_regression?.slope || 0.0,
          pValue: analysisResult.mann_kendall?.p_value ?? 0.05,
          ci: analysisResult.sens_slope ? `${analysisResult.sens_slope.confidence_interval_95[0]} to ${analysisResult.sens_slope.confidence_interval_95[1]}` : '+0.04 to +0.22',
          summary: analysisResult.plain_language_interpretation,
          values: activeObservations.values,
          labels: activeObservations.labels,
          live: true,
          comprehensiveResult: analysisResult,
        }
        onAnalysisReady?.(analysisData)
        navigate('/analysis')
        return
      }
      throw new Error('Proceed with fallback analysis')
    } catch {
      const fallbackAnalysis = {
        ...demoAnalysis,
        variable: form.variable,
        variableName: activeVariable.name,
        location: isCustom ? `Custom Coordinates` : activeLocation.name,
        unit: activeVariable.unit,
        period: `${form.start.slice(0, 4)}–${form.end.slice(0, 4)}`,
        values: activeObservations.values,
        labels: activeObservations.labels,
        live: false
      }
      onAnalysisReady?.(fallbackAnalysis)
      navigate('/analysis')
    }
  }

  function downloadCsv() {
    const content = [
      'period,value,unit,variable,dataset,location,provenance',
      ...activeObservations.labels.map(
        (lbl, idx) => `${lbl},${activeObservations.values[idx] ?? ''},${activeObservations.unit},${activeVariable.id},${activeDataset.id},${isCustom ? 'Custom' : activeLocation.name},"${activeObservations.provenance || 'TerraTrend Observation'}"`
      )
    ].join('\n')

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TerraTrend_${form.variable}_${isCustom ? 'custom' : activeLocation.id}_observations.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="STEP-BY-STEP DATA SELECTION"
        title="Data Explorer"
        description="Select registered NASA Earth science datasets and variables, choose a study region, preview satellite granules, and execute observation retrievals."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={downloadCsv} className="button button-secondary">
              <Download size={14} />
              <span>Download CSV</span>
            </button>
            <button onClick={handleLaunchTrendAnalysis} className="button button-primary">
              <LineChart size={14} />
              <span>Start Trend Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        }
      />

      <SourceBanner isLive={isLive} />

      {/* Query Form Panel */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <h3>
            <SlidersHorizontal size={17} style={{ color: 'var(--primary-blue)' }} />
            <span>Step-by-Step Data Selection</span>
          </h3>
          <button 
            type="button" 
            onClick={handleClearFilters}
            className="button button-ghost"
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>

        <form onSubmit={handleQueryData} className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '18px' }}>
            {/* Step 1: Dataset */}
            <div className="field">
              <label htmlFor="select-dataset">Step 1: NASA Dataset</label>
              <select
                id="select-dataset"
                value={form.dataset}
                onChange={(e) => setForm({ ...form, dataset: e.target.value })}
                className="select"
              >
                {(datasetsList ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.mission ? `(${d.mission})` : ''}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
                Resolution: {activeDataset.resolution || 'Standard satellite resolution'}
              </small>
            </div>

            {/* Step 2: Environmental Variable */}
            <div className="field">
              <label htmlFor="select-variable">Step 2: Environmental Variable</label>
              <select
                id="select-variable"
                value={form.variable}
                onChange={(e) => setForm({ ...form, variable: e.target.value })}
                className="select"
              >
                {(availableVarsForDataset ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} [{v.unit}]
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
                {activeVariable?.description || 'Physical variable measured by satellite sensor'}
              </small>
            </div>

            {/* Step 3: Location / Region */}
            <div className="field">
              <label htmlFor="select-location">Step 3: Geographical Study Region</label>
              <select
                id="select-location"
                value={form.location}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="select"
              >
                {(regionsList ?? []).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.region ? `(${loc.region})` : ''}
                  </option>
                ))}
                <option value="custom">Custom Coordinates (Lat/Lng)</option>
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
                {activeLocation?.description ? activeLocation.description.slice(0, 65) + '...' : 'Coordinates bounded area'}
              </small>
            </div>

            {/* Step 4: Date Range */}
            <div className="field">
              <label htmlFor="input-start-date">Step 4: Observation Window</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  id="input-start-date"
                  type="date"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  className="input"
                  title="Start Date"
                />
                <input
                  id="input-end-date"
                  type="date"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  className="input"
                  title="End Date"
                />
              </div>
              <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
                Historical observation boundaries
              </small>
            </div>
          </div>

          {/* Custom Coordinates (if selected) */}
          {isCustom && (
            <div className="field-group" style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <div className="field">
                <label htmlFor="input-lat">Latitude (° N/S)</label>
                <input
                  id="input-lat"
                  type="number"
                  step="0.0001"
                  value={form.customLat}
                  onChange={(e) => setForm({ ...form, customLat: e.target.value })}
                  placeholder="e.g. 11.0168"
                  className="input"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="input-lng">Longitude (° E/W)</label>
                <input
                  id="input-lng"
                  type="number"
                  step="0.0001"
                  value={form.customLng}
                  onChange={(e) => setForm({ ...form, customLng: e.target.value })}
                  placeholder="e.g. 76.9558"
                  className="input"
                  required
                />
              </div>
            </div>
          )}

          {/* Granule Preview Box (If previewed) */}
          {previewInfo && (
            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '14px 18px', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HardDrive size={20} style={{ color: 'var(--primary-blue)' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block' }}>
                    NASA CMR Catalog Availability
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Matching Granules: <strong>{previewInfo.granules_found}</strong> · Estimated Size: <strong>{previewInfo.estimated_size_mb} MB</strong> · Cached: <strong>{previewInfo.is_cached ? 'Yes' : 'No'}</strong>
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Access Method: {previewInfo.access_method || 'NASA GES DISC / AppEEARS'}
              </div>
            </div>
          )}

          {/* Job Progress Indicator */}
          {jobProgress.active && (
            <div style={{ 
              background: 'var(--blue-soft)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '16px',
              fontSize: '12.5px',
              color: 'var(--primary-blue)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <LoaderCircle size={15} className="spin" />
                <strong>Retrieval Progress: {jobProgress.message}</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${jobProgress.percent}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Validation & Status Message */}
          {status.message && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '12.5px', 
              marginBottom: '16px',
              background: status.type === 'error' ? 'var(--red-soft)' : status.type === 'success' ? 'var(--green-soft)' : 'var(--blue-soft)',
              color: status.type === 'error' ? 'var(--red)' : status.type === 'success' ? 'var(--green)' : 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} />
              <span>{status.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={handlePreviewNASAData} 
              disabled={previewLoading || !isLive}
              className="button button-secondary"
            >
              <FileSearch size={14} />
              <span>{previewLoading ? 'Checking Availability...' : 'Step 5A: Preview NASA Granules'}</span>
            </button>
            <button 
              type="submit" 
              disabled={jobProgress.active}
              className="button button-primary"
            >
              <Search size={15} />
              <span>Step 5B: Retrieve NASA Data</span>
            </button>
          </div>
        </form>
      </div>

      {/* Observation Summary Info Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Variable</span>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '4px' }}>{activeVariable.name}</strong>
          <small style={{ color: 'var(--text-muted)' }}>Unit: {activeObservations.unit || activeVariable.unit}</small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Dataset</span>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '4px' }}>{activeDataset.name}</strong>
          <small style={{ color: 'var(--text-muted)' }}>{activeDataset.mission || 'NASA EOS'}</small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '4px' }}>
            {isCustom ? 'Custom Coordinates' : activeLocation.name}
          </strong>
          <small style={{ color: 'var(--text-muted)' }}>{isCustom ? `${form.customLat}, ${form.customLng}` : (activeLocation.region || 'Study Region')}</small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Observations</span>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '4px' }}>{activeObservations.stats.count} Points</strong>
          <small style={{ color: 'var(--text-muted)' }}>{activeObservations.isLive ? 'Live Observations' : 'Illustrative Demo'}</small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Average Value</span>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-blue)', marginTop: '4px' }}>{activeObservations.stats.mean} {activeObservations.unit || activeVariable.unit}</strong>
          <small style={{ color: 'var(--text-muted)' }}>Min: {activeObservations.stats.min} | Max: {activeObservations.stats.max}</small>
        </div>
      </div>

      {/* Observation Chart / Table Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>
              <LineChart size={17} style={{ color: 'var(--primary-blue)' }} />
              <span>Observation Data: {activeVariable.name}</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Historical series for {isCustom ? 'Custom Pin' : activeLocation.name} ({form.start.slice(0, 4)}–{form.end.slice(0, 4)}) · {activeObservations.provenance}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setViewMode('chart')}
              className={`button ${viewMode === 'chart' ? 'button-primary' : 'button-secondary'}`}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              <LineChart size={13} />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`button ${viewMode === 'table' ? 'button-primary' : 'button-secondary'}`}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              <Table size={13} />
              <span>Data Table</span>
            </button>
            <button onClick={downloadCsv} className="button button-ghost" style={{ padding: '5px 10px', fontSize: '12px' }}>
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div className="panel-body">
          {viewMode === 'chart' ? (
            <TrendChart
              ref={chartRef}
              labels={activeObservations.labels}
              values={activeObservations.values}
              unit={activeObservations.unit || activeVariable.unit}
              label={`${isCustom ? 'Custom' : activeLocation.name} ${activeVariable.id}`}
              showTrend={true}
              height={320}
              variableKey={form.variable}
            />
          ) : (
            <div className="data-table-container">
              <table className="data-table" aria-label="Observations table">
                <thead>
                  <tr>
                    <th>Time Period</th>
                    <th>Measured Value ({activeObservations.unit || activeVariable.unit})</th>
                    <th>Variable</th>
                    <th>NASA Dataset</th>
                    <th>Region</th>
                  </tr>
                </thead>
                <tbody>
                  {activeObservations.labels.map((lbl, idx) => (
                    <tr key={lbl}>
                      <td style={{ fontWeight: 600 }}>{lbl}</td>
                      <td>{activeObservations.values[idx] ?? '—'} {activeObservations.unit || activeVariable.unit}</td>
                      <td>{activeVariable.name}</td>
                      <td>{activeDataset.name}</td>
                      <td>{isCustom ? 'Custom' : activeLocation.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
