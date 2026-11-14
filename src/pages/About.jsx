import { ArrowRight, Beaker, Code2, Database, HeartHandshake, ShieldCheck, Satellite, Cpu, Layers, GitBranch, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI'

const workflowStages = [
  { step: '1', title: 'NASA Data Sources', desc: 'Sourcing continuous satellite telemetry from NASA POWER, MERRA-2, MODIS, and GPM.' },
  { step: '2', title: 'Backend Processing', desc: 'Python FastAPI cleans, aligns, normalizes temporal frequencies, and checks anomalies.' },
  { step: '3', title: 'Statistical Analysis', desc: 'SciPy executes non-parametric Mann-Kendall trend tests and Sen’s slope regressions.' },
  { step: '4', title: 'Frontend Visualization', desc: 'React with Chart.js and React Leaflet renders accessible charts and maps.' },
  { step: '5', title: 'Scientific Insights', desc: 'Evidence-grounded assistant and automated report dossiers generate actionable insights.' },
]

const teamMembers = [
  { 
    role: 'Member 1 – Frontend Architecture (Me)', 
    focus: 'UI/UX design, accessible component library, responsive navigation, React Leaflet GIS integration, and Chart.js visualization.' 
  },
  { 
    role: 'Member 2 – NASA API Integration', 
    focus: 'Python FastAPI data connectors, NASA POWER and Earthdata API parameter filtering, authentication, and endpoint routing.' 
  },
  { 
    role: 'Member 3 – Data Processing', 
    focus: 'Pandas & NumPy data pipelines, missing value imputation, unit normalization, and temporal aggregations.' 
  },
  { 
    role: 'Member 4 – Statistical Analysis', 
    focus: 'Non-parametric Mann-Kendall monotonic trend tests, Sen’s slope median estimation, and p-value statistical bounds.' 
  },
  { 
    role: 'Member 5 – AI Environmental Insights', 
    focus: 'Evidence-conditioned LLM orchestration, prompt calibration, and telemetry fact-checking without data hallucination.' 
  },
  { 
    role: 'Member 6 – Testing & Deployment', 
    focus: 'End-to-end integration testing, CORS configuration, accessibility compliance verification, and production build.' 
  },
]

export default function About() {
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="ABOUT THE PROJECT"
        title="About Earth Trend Detective"
        description="Developed for the NASA Space Apps Challenge 2026, Earth Trend Detective makes multi-decadal NASA Earth observations understandable, accessible, and actionable for everyone."
        actions={
          <Link to="/explorer" className="button button-primary">
            <Database size={15} />
            <span>Explore Data</span>
            <ArrowRight size={15} />
          </Link>
        }
      />

      {/* Project Objective & Scientific Challenge */}
      <section className="panel" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '820px' }}>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            <span>NASA SPACE APPS CHALLENGE 2026</span>
          </div>
          <h2 style={{ fontSize: '22px', color: 'var(--text-main)', margin: '6px 0 12px' }}>
            Be an Earth Systems Trend Detective!
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '14px' }}>
            Earth's climate fluctuates naturally with the seasons, but long-term systematic changes require rigorous statistical verification. 
            The goal of <strong>Earth Trend Detective</strong> is to provide students, researchers, teachers, and the general public with 
            an accessible tool to investigate genuine environmental trends using authentic NASA Earth science data.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 600 }}>
            <span>✓ Verified NASA Data</span>
            <span>✓ Non-Parametric Statistics</span>
            <span>✓ Accessible for Everyone</span>
          </div>
        </div>
      </section>

      {/* Simple Architecture Diagram */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <h3>
            <GitBranch size={17} style={{ color: 'var(--primary-blue)' }} />
            <span>System Architecture Flow</span>
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Scientific Pipeline
          </span>
        </div>
        <div className="panel-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Our platform operates via a transparent scientific data flow:
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            {workflowStages.map((stage, idx) => (
              <div 
                key={stage.step}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  flex: '1 1 180px',
                  minWidth: '160px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)' }}>
                    Stage 0{stage.step}
                  </span>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
                </div>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-main)', display: 'block' }}>
                  {stage.title}
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.45' }}>
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6-Member Team Contribution Areas */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <h3>
            <UserCheck size={17} style={{ color: 'var(--green)' }} />
            <span>Six-Member Development Team Roles</span>
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--primary-blue)' }}>
            Technical Matrix
          </span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {teamMembers.map((member, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '16px' 
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: idx === 0 ? 'var(--primary-blue)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {idx === 0 ? '★ Active Role' : 'Teammate Role'}
                </span>
                <h4 style={{ fontSize: '14.5px', color: 'var(--text-main)', margin: '4px 0 6px' }}>
                  {member.role}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {member.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASA Space Apps Challenge Disclosure */}
      <section className="panel" style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
              Project Notice & Open Science Disclosure
            </strong>
            This application is an independent submission developed for the NASA Space Apps Challenge 2026. 
            All environmental observation data is retrieved from publicly available NASA Earth Science data archives 
            (such as NASA POWER and MERRA-2). This website is not an official NASA product.
          </div>
        </div>
      </section>
    </div>
  )
}
