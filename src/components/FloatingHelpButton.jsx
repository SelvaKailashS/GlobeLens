import { useState } from 'react'
import { HelpCircle, X, ExternalLink, Satellite, ShieldCheck, Database, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-help-btn"
        aria-label="Scientific Platform Quick Guide"
        title="Scientific Platform Quick Guide"
      >
        {isOpen ? <X size={20} /> : <HelpCircle size={20} />}
      </button>

      {isOpen && (
        <div className="floating-help-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--nasa-blue)' }}>
              <Satellite size={18} />
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.04em' }}>
                EARTH TREND DETECTIVE
              </strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
            Investigate planetary change across temperature, rainfall, and soil moisture using verified NASA Earth observations 
            and non-parametric Mann-Kendall trend testing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <Link to="/explorer" onClick={() => setIsOpen(false)} className="help-link">
              <Database size={15} style={{ color: 'var(--cyan)' }} />
              <div>
                <strong>Earth Data Explorer</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)' }}>Query multi-decadal time series</small>
              </div>
            </Link>

            <Link to="/map" onClick={() => setIsOpen(false)} className="help-link">
              <Layers size={15} style={{ color: 'var(--green)' }} />
              <div>
                <strong>Global Geospatial Map</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)' }}>Observe station markers & signals</small>
              </div>
            </Link>

            <Link to="/analysis" onClick={() => setIsOpen(false)} className="help-link">
              <ShieldCheck size={15} style={{ color: '#F59E0B' }} />
              <div>
                <strong>Non-Parametric Trend Analysis</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)' }}>Sen's slope & p-value bounds</small>
              </div>
            </Link>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>NASA Space Apps 2026</span>
            <Link to="/about" onClick={() => setIsOpen(false)} style={{ color: 'var(--nasa-blue)', fontWeight: 600 }}>
              Full Methodology &rarr;
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

