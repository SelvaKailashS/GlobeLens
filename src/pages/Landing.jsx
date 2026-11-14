import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Check, 
  Database, 
  Globe2, 
  LineChart, 
  ShieldCheck, 
  Sparkles,
  Satellite,
  Compass,
  Layers,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Search,
  Activity,
  Layers3,
  BarChart3,
  FileText,
  HelpCircle,
  TrendingUp,
  MapPin,
  Bot
} from 'lucide-react'
import { useBackend } from '../context/BackendContext'
import EarthGlobe from '../components/EarthGlobe'
import { datasets, variables } from '../data/demoData'

export default function Landing() {
  const { isLive } = useBackend()

  return (
    <div>
      {/* ============================================================
          1. HERO SECTION: Simple, Professional, Earth-Related
          ============================================================ */}
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="hero-copy">
            <div className="home-hero-badge">
              <Satellite size={13} aria-hidden="true" />
              <span>NASA SPACE APPS CHALLENGE 2026</span>
            </div>

            <h1>
              Discover the Hidden Trends of <span>Our Changing Earth</span>
            </h1>

            <p className="hero-sub">
              Explore NASA Earth science data, understand environmental changes, and discover 
              how our planet is changing across different regions and time.
            </p>

            <div className="hero-actions">
              <Link to="/explorer" className="button button-primary">
                <Database size={16} aria-hidden="true" />
                <span>Explore Data</span>
              </Link>
              <Link to="/analysis" className="button button-secondary">
                <LineChart size={16} aria-hidden="true" />
                <span>Start Analysis</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <div className="hero-indicators">
              <span><Check size={14} style={{ color: 'var(--green)' }} /> Authentic NASA Observations</span>
              <span><Check size={14} style={{ color: 'var(--green)' }} /> Verified Statistical Trends</span>
              <span><Check size={14} style={{ color: 'var(--green)' }} /> Accessible for Everyone</span>
            </div>
          </div>

          {/* Clean Earth Graphic / Realistic Globe */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <EarthGlobe height={420} />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FEATURED ENVIRONMENTAL VARIABLES
          ============================================================ */}
      <section className="section-editorial">
        <div className="editorial-container">
          <div className="section-head">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>KEY INDICATORS</span>
            </div>
            <h2>Featured Environmental Variables</h2>
            <p>
              Easily track essential climate and ecosystem variables collected by NASA satellites, 
              weather reanalysis, and land surface models.
            </p>
          </div>

          <div className="editorial-grid">
            <article className="editorial-card">
              <div className="editorial-icon">
                <Thermometer size={22} aria-hidden="true" />
              </div>
              <h3>Air Temperature (2m)</h3>
              <p>
                Track surface warming rates, seasonal shifts, and temperature anomalies over multiple decades.
              </p>
              <Link to="/explorer?var=T2M" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Temperature <ArrowRight size={13} />
              </Link>
            </article>

            <article className="editorial-card">
              <div className="editorial-icon">
                <CloudRain size={22} aria-hidden="true" />
              </div>
              <h3>Precipitation Flux</h3>
              <p>
                Analyze rainfall volume, dry-spell patterns, and monsoon variations using bias-corrected observations.
              </p>
              <Link to="/explorer?var=PRECTOTCORR" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Precipitation <ArrowRight size={13} />
              </Link>
            </article>

            <article className="editorial-card">
              <div className="editorial-icon">
                <Droplets size={22} aria-hidden="true" />
              </div>
              <h3>Soil Moisture</h3>
              <p>
                Examine topsoil moisture levels to understand agricultural drought vulnerability and water storage.
              </p>
              <Link to="/explorer?var=GWETTOP" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Soil Moisture <ArrowRight size={13} />
              </Link>
            </article>

            <article className="editorial-card">
              <div className="editorial-icon">
                <Layers3 size={22} aria-hidden="true" />
              </div>
              <h3>Vegetation Index (NDVI)</h3>
              <p>
                Observe vegetation vitality, forest canopy health, and greenness changes over seasons.
              </p>
              <Link to="/explorer?var=NDVI" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Vegetation <ArrowRight size={13} />
              </Link>
            </article>

            <article className="editorial-card">
              <div className="editorial-icon">
                <Wind size={22} aria-hidden="true" />
              </div>
              <h3>Surface Wind Speed</h3>
              <p>
                Inspect near-surface wind speeds to understand energy dynamics and atmospheric circulation.
              </p>
              <Link to="/explorer?var=WS2M" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Wind Speed <ArrowRight size={13} />
              </Link>
            </article>

            <article className="editorial-card">
              <div className="editorial-icon">
                <Activity size={22} aria-hidden="true" />
              </div>
              <h3>Total Column Ozone</h3>
              <p>
                Monitor atmospheric ozone concentration to understand atmospheric protection and UV filtration.
              </p>
              <Link to="/explorer?var=TO3" style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Ozone <ArrowRight size={13} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. HOW IT WORKS (Simple 4-Step Scientific Workflow)
          ============================================================ */}
      <section className="workflow-section">
        <div className="workflow-container">
          <div className="section-head">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>SIMPLE WORKFLOW</span>
            </div>
            <h2>How It Works</h2>
            <p>
              Anyone can analyze environmental changes in four clear and intuitive steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              {
                step: 'Step 1',
                title: 'Choose Variable & Location',
                desc: 'Select an environmental indicator (like temperature or rainfall) and pick any city or coordinates.'
              },
              {
                step: 'Step 2',
                title: 'Retrieve NASA Observations',
                desc: 'The platform retrieves multi-decadal time-series observations from verified NASA archives.'
              },
              {
                step: 'Step 3',
                title: 'Analyze Statistical Trends',
                desc: 'Standard non-parametric algorithms (Mann-Kendall & Sen’s slope) determine if changes are genuine.'
              },
              {
                step: 'Step 4',
                title: 'Understand & Export Insights',
                desc: 'Read straightforward explanations, ask the AI research assistant, and export reports in CSV or PDF.'
              }
            ].map((s) => (
              <div key={s.step} className="panel" style={{ padding: '22px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>
                  {s.step}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', margin: '8px 0 6px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/explorer" className="button button-primary">
              <Database size={15} />
              <span>Try Data Explorer</span>
            </Link>
            <Link to="/map" className="button button-secondary">
              <Globe2 size={15} />
              <span>Open Global Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. SUPPORTED NASA DATA SOURCES
          ============================================================ */}
      <section className="section-editorial">
        <div className="editorial-container">
          <div className="section-head">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              <span>DATA PROVENANCE</span>
            </div>
            <h2>Supported NASA Data Sources</h2>
            <p>
              Our platform interfaces with reputable scientific assimilation systems and satellite missions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {(datasets ?? []).map((ds) => (
              <div key={ds.id} className="panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-blue)', background: 'var(--blue-soft)', padding: '2px 8px', borderRadius: '4px' }}>
                    {ds.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {ds.resolution}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', color: 'var(--text-main)', margin: '6px 0' }}>
                  {ds.mission || 'NASA Mission'}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {ds.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. ABOUT THE PROJECT & CALL TO ACTION
          ============================================================ */}
      <section style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
            Start Investigating Planetary Trends Today
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Whether you are a student writing an assignment, a teacher explaining climate concepts, 
            or a scientist verifying long-term data, Earth Trend Detective gives you direct access to 
            NASA observations with zero complexity.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/explorer" className="button button-primary">
              <Database size={15} />
              <span>Explore Earth Data</span>
            </Link>
            <Link to="/about" className="button button-secondary">
              <span>Learn About the Project</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
