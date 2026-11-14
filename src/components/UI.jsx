import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Info, 
  LoaderCircle, 
  Minus, 
  Sparkles,
  Database,
  Radio,
  Satellite
} from 'lucide-react'
import { useBackend } from '../context/BackendContext'

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'cyan', trend }) {
  return (
    <motion.div 
      className={`stat-card tone-${tone}`} 
      whileHover={{ y: -3, scale: 1.01 }} 
      transition={{ duration: 0.16 }}
    >
      <div className="stat-card-top">
        <span>{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon size={16} />
          </span>
        )}
      </div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
      {trend && <span className="stat-trend">{trend}</span>}
    </motion.div>
  )
}

export function SourceBanner({ compact = false, isLive: explicitLive }) {
  const { isLive: contextLive } = useBackend()
  const live = explicitLive !== undefined ? explicitLive : contextLive

  if (live) {
    return (
      <div className={`source-banner live-mode ${compact ? 'compact' : ''}`}>
        <span className="source-icon">
          <Satellite size={16} />
        </span>
        <div>
          <strong>Live NASA POWER Integration Active</strong>
          <span>Connected to FastAPI on port 8000. Data streamed directly from NASA MERRA-2 assimilation archives.</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`source-banner ${compact ? 'compact' : ''}`}>
      <span className="source-icon">
        <Info size={16} />
      </span>
      <div>
        <strong>Demonstration Mode (FastAPI Offline)</strong>
        <span>Displaying scientifically calibrated illustrative observations. Connect FastAPI on :8000 for live satellite queries.</span>
      </div>
    </div>
  )
}

export function TrendBadge({ value }) {
  const normalized = String(value || '').toLowerCase()
  const isUp = normalized.includes('increas') || normalized.includes('upward') || normalized.includes('+')
  const isDown = normalized.includes('decreas') || normalized.includes('downward') || normalized.includes('−') || normalized.includes('-')
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus
  const tone = isUp ? 'positive' : isDown ? 'negative' : 'neutral'

  return (
    <span className={`trend-badge ${tone}`}>
      <Icon size={14} />
      <span>{value}</span>
    </span>
  )
}

export function LoadingState({ label = 'Querying NASA Earth Data Layer...' }) {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={22} style={{ color: 'var(--cyan)' }} />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="error-state">
      <AlertTriangle size={20} />
      <div>
        <strong>NASA Mission Data Notice</strong>
        <span>{message || 'Could not retrieve requested observational record from backend.'}</span>
      </div>
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon = Sparkles, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: '14px' }}>{action}</div>}
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Confirmed({ children }) {
  return (
    <span className="confirmed">
      <CheckCircle2 size={13} />
      <span>{children}</span>
    </span>
  )
}
