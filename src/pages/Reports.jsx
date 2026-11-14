import { useState } from 'react'
import { Download, FileText, Printer, Share2, ShieldCheck, Database, Calendar, Eye, CheckCircle2, FileJson } from 'lucide-react'
import { demoAnalysis, getSeries, getVariable, timeLabels, locations, variables, datasets } from '../data/demoData'
import { PageHeader, SourceBanner, TrendBadge } from '../components/UI'
import TrendChart from '../components/TrendChart'
import { useBackend } from '../context/BackendContext'

// Pre-configured reports list for historical review
const defaultReportList = [
  {
    id: 'rep-1',
    title: 'Coimbatore Surface Temperature Trend (2010–2024)',
    variable: 'T2M',
    dataset: 'NASA POWER (MERRA-2)',
    region: 'Coimbatore, Tamil Nadu',
    period: '2010–2024',
    direction: 'Increasing (+0.13 °C/yr)',
    pValue: 'p = 0.018',
    generatedDate: '2026-10-12',
  },
  {
    id: 'rep-2',
    title: 'Chennai Coastal Precipitation Flux (2010–2024)',
    variable: 'PRECTOTCORR',
    dataset: 'NASA GPM (IMERG)',
    region: 'Chennai, Tamil Nadu',
    period: '2010–2024',
    direction: 'Decreasing (-0.04 mm/day/yr)',
    pValue: 'p = 0.061',
    generatedDate: '2026-10-14',
  },
  {
    id: 'rep-3',
    title: 'Amazon Basin Canopy Stress & Precipitation Review (2020–2024)',
    variable: 'precipitation',
    dataset: 'NASA GPM (IMERG Final)',
    region: 'Amazon Rainforest Basin',
    period: '2020–2024',
    direction: 'Decreasing (-0.02 mm/hr/yr)',
    pValue: 'p = 0.042',
    generatedDate: '2026-10-18',
  },
  {
    id: 'rep-4',
    title: 'Greenland Ice Sheet Surface Albedo & Temperature Drift',
    variable: 'SurfAirTemp_A',
    dataset: 'NASA AIRS (Aqua)',
    region: 'Greenland Ice Sheet',
    period: '2010–2024',
    direction: 'Increasing (+0.65 K/decade)',
    pValue: 'p = 0.003',
    generatedDate: '2026-10-22',
  }
]

function downloadCsv(analysis) {
  const values = analysis.values || analysis.series || getSeries(analysis.variable)
  const labels = analysis.labels || timeLabels
  const content = [
    'period,value,unit,variable,location,trend_direction,slope,p_value',
    ...labels.map(
      (label, index) =>
        `${label},${values[index] ?? ''},${analysis.unit || 'units'},${analysis.variable || 'variable'},${analysis.location || 'region'},${analysis.direction || 'Increasing'},${analysis.slope || 0.13},${analysis.pValue || 0.018}`
    ),
  ].join('\n')

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `TerraTrend_Report_${analysis.variable || 'var'}_${analysis.location || 'loc'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function downloadJson(analysis) {
  const exportPayload = {
    title: `TerraTrend Scientific Report: ${analysis.location || 'Selected Region'}`,
    timestamp_utc: new Date().toISOString(),
    platform: 'TerraTrend NASA Earth Science Detective',
    variable: analysis.variable,
    variable_name: analysis.variableName,
    unit: analysis.unit,
    region: analysis.location,
    period: analysis.period,
    trend_metrics: {
      direction: analysis.direction,
      slope: analysis.slope,
      p_value: analysis.pValue,
      confidence_interval: analysis.ci,
    },
    observations: (analysis.labels || timeLabels).map((lbl, idx) => ({
      period: lbl,
      value: (analysis.values || analysis.series || [])[idx] ?? null,
    })),
    comprehensive_diagnostics: analysis.comprehensiveResult || null,
  }

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `TerraTrend_Report_${analysis.variable || 'var'}_${analysis.location || 'loc'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function Reports({ analysis }) {
  const active = analysis || demoAnalysis
  const [selectedReport, setSelectedReport] = useState(defaultReportList[0])
  const [copied, setCopied] = useState(false)
  const { isLive } = useBackend()

  const labels = active.labels || timeLabels
  const values = active.values || active.series || getSeries(active.variable)
  const activeVar = getVariable(active.variable) || { name: active.variableName || active.variable, unit: active.unit || 'units' }

  function handlePrintPdf() {
    window.print()
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="SCIENTIFIC REPORTS & EXPORTS"
        title="Reports"
        description="Browse generated environmental trend reports, inspect detailed statistical dossiers, and export data in CSV, JSON, or print-ready PDF formats."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleShare} className="button button-ghost">
              <Share2 size={14} />
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
            <button onClick={handlePrintPdf} className="button button-secondary">
              <Printer size={14} />
              <span>Export PDF</span>
            </button>
            <button onClick={() => downloadJson(active)} className="button button-secondary">
              <FileJson size={14} />
              <span>Export JSON</span>
            </button>
            <button onClick={() => downloadCsv(active)} className="button button-primary">
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      <SourceBanner isLive={isLive} />

      {/* Available Reports Table */}
      <div className="panel" style={{ marginBottom: '28px' }}>
        <div className="panel-header">
          <h3>
            <FileText size={17} style={{ color: 'var(--primary-blue)' }} />
            <span>Generated Environmental Reports</span>
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {defaultReportList.length} Reports
          </span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="data-table-container">
            <table className="data-table" aria-label="Generated Environmental Reports Table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Variable</th>
                  <th>NASA Dataset</th>
                  <th>Region</th>
                  <th>Analysis Period</th>
                  <th>Trend Direction</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {defaultReportList.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td>{r.variable}</td>
                    <td>{r.dataset}</td>
                    <td>{r.region}</td>
                    <td>{r.period}</td>
                    <td>
                      <span style={{ color: r.direction.includes('+') ? 'var(--amber)' : 'var(--green)', fontWeight: 600 }}>
                        {r.direction}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.generatedDate}</td>
                    <td>
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="button button-ghost"
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Dossier Preview Document */}
      <div className="panel" style={{ padding: '36px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-blue)', marginBottom: '6px' }}>
              <ShieldCheck size={18} />
              <strong style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TerraTrend · NASA Space Apps Scientific Report
              </strong>
            </div>
            <h1 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '4px 0' }}>
              {selectedReport ? selectedReport.title : `Planetary Trend Dossier: ${active.location || 'Coimbatore'}`}
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              NASA Earth Science Division · Verified Multi-Decadal Reanalysis & Observations
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <TrendBadge value={active.direction || 'Increasing'} />
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Classification: Verified Signal
            </span>
          </div>
        </div>

        {/* Statistical Overview Box */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Variable</span>
            <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>{activeVar.name}</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Sen's Slope</span>
            <strong style={{ display: 'block', fontSize: '14px', color: active.slope > 0 ? 'var(--amber)' : 'var(--green)', marginTop: '2px' }}>
              {active.slope > 0 ? '+' : ''}{active.slope ?? 0.13} {active.unit || 'units'} / yr
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>P-Value</span>
            <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-blue)', marginTop: '2px' }}>
              p = {active.pValue ?? 0.018} ({active.pValue < 0.05 ? 'Significant' : 'Calculated'})
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>95% Confidence Bounds</span>
            <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)', marginTop: '2px' }}>
              {active.ci || '+0.041 to +0.218'}
            </strong>
          </div>
        </div>

        {/* Chart inside report */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '10px' }}>
            Time Series & Linear Trend
          </h3>
          <TrendChart
            labels={labels}
            values={values}
            unit={active.unit || 'units'}
            label={`${active.location || 'Coimbatore'} ${active.variable || 'T2M'}`}
            showTrend={true}
            height={260}
            variableKey={active.variable || 'T2M'}
          />
        </div>

        {/* Narrative & Recommendations */}
        <div style={{ fontSize: '13px', lineHeight: '1.65', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>
            Scientific Explanation & Practical Guidance
          </h3>
          <p style={{ marginBottom: '10px' }}>
            {active.summary || (
              `Analysis of multi-decadal observations for ${active.location || 'Coimbatore'} shows a verified ${active.direction || 'increasing'} trend (${active.slope > 0 ? '+' : ''}${active.slope ?? 0.13} ${active.unit || 'units'}/year) across the evaluated observational period. Statistical significance establishes an empirical pattern in historical observations; it does not by itself establish physical causality or guarantee indefinite future continuation.`
            )}
          </p>
          <p>
            <strong>Practical Recommendation:</strong> Environmental managers, urban planners, and agriculturalists should incorporate these long-term trends and non-parametric bounds into climate adaptation and water management policies.
          </p>
        </div>

        {/* Footer info in report */}
        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>NASA Earth Science System · TerraTrend Detective</span>
          <span>Challenge: NASA Space Apps 2026</span>
        </div>
      </div>
    </div>
  )
}
