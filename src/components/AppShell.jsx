import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Satellite, 
  ChevronRight, 
  Globe2, 
  Database, 
  LineChart, 
  Scale, 
  Bot, 
  FileText, 
  LayoutDashboard,
  Sun,
  Moon,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Info
} from 'lucide-react'
import { useBackend } from '../context/BackendContext'
import { useTheme } from '../context/ThemeContext'
import FloatingHelpButton from './FloatingHelpButton'

export const navItems = [
  { to: '/', label: 'Home', icon: Globe2 },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explorer', label: 'Data Explorer', icon: Database },
  { to: '/map', label: 'Earth Map', icon: Compass },
  { to: '/analysis', label: 'Trend Analysis', icon: LineChart },
  { to: '/compare', label: 'Region Comparison', icon: Scale },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/about', label: 'About', icon: Info },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isLive, checking } = useBackend()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="site-navbar">
      <div className="nav-container">
        {/* Brand Logo & Name */}
        <Link to="/" className="nav-brand" aria-label="Earth System Trend Detective Home">
          <div className="brand-mark">
            <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
              <circle cx="20" cy="20" r="14" fill="none" stroke="var(--primary-blue)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="20" cy="20" r="9" fill="var(--primary-blue)" />
              <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="var(--secondary-blue)" strokeWidth="1.5" transform="rotate(-28 20 20)" />
              <circle cx="6" cy="13" r="2" fill="var(--primary-blue)" />
            </svg>
          </div>
          <div className="brand-text">
            <strong>Earth Trend Detective</strong>
            <small>NASA Earth Science Platform</small>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main Navigation">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Status Pill & Theme Switch */}
        <div className="nav-actions">
          <div 
            className={`nav-status-pill ${isLive ? 'online' : 'offline'}`} 
            title="Backend server status on http://localhost:8000"
            role="status"
            aria-live="polite"
          >
            <span className={`status-dot ${isLive ? '' : 'amber'}`} aria-hidden="true" />
            <span>{checking ? 'Checking...' : isLive ? 'Backend Live' : 'Demo Mode'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>

          <Link to="/explorer" className="button button-small button-primary">
            <span>Explore Data</span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="navigation" aria-label="Mobile Navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
              <ChevronRight size={14} aria-hidden="true" />
            </NavLink>
          ))}
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              className="button button-secondary"
              style={{ flex: 1 }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <Link to="/explorer" onClick={() => setMobileMenuOpen(false)} className="button button-primary" style={{ flex: 1 }}>
              <span>Explore Data</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Workspace Sidebar">
      <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
        {!collapsed && (
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
            Navigation
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="button button-ghost"
          style={{ padding: '4px', width: '28px', height: '28px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} aria-hidden="true" style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export function Footer() {
  const { isLive } = useBackend()

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="nav-brand" style={{ marginBottom: '10px' }}>
            <div className="brand-mark">
              <svg viewBox="0 0 40 40" width="24" height="24" aria-hidden="true">
                <circle cx="20" cy="20" r="14" fill="none" stroke="var(--primary-blue)" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="8" fill="var(--primary-blue)" />
              </svg>
            </div>
            <div className="brand-text">
              <strong>Earth Trend Detective</strong>
              <small>NASA Space Apps 2026</small>
            </div>
          </div>
          <p>
            An accessible scientific platform enabling students, researchers, and the general public 
            to investigate environmental changes using NASA Earth observation data.
          </p>
        </div>

        <div className="footer-column">
          <h4>Research Workspaces</h4>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/explorer">Data Explorer</Link></li>
            <li><Link to="/map">Earth Map</Link></li>
            <li><Link to="/analysis">Trend Analysis</Link></li>
            <li><Link to="/compare">Region Comparison</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>NASA Data Sources</h4>
          <ul>
            <li>NASA POWER (MERRA-2 Synthesis)</li>
            <li>MODIS (Surface & Biosphere)</li>
            <li>GPM (Precipitation Constellation)</li>
            <li>GLDAS (Soil Moisture & Hydrology)</li>
            <li>AIRS & OMI (Atmospheric Chemistry)</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Platform Status</h4>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Backend Status:</span>
              <strong style={{ color: isLive ? 'var(--green)' : 'var(--amber)' }}>
                {isLive ? 'Connected (:8000)' : 'Demo Mode'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>Challenge:</span>
              <strong>NASA Space Apps 2026</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          Independent scientific project developed for the NASA Space Apps Challenge 2026. Not an official NASA website.
        </div>
        <div>
          Member 1 – Frontend Development | Six-Member Space Apps Engineering Team
        </div>
      </div>
    </footer>
  )
}

export function AppShell({ children }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-shell-root">
      <Navbar />
      {isLanding ? (
        <main>{children}</main>
      ) : (
        <div className="app-workspace-layout">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <main className="app-workspace-content">{children}</main>
        </div>
      )}
      <Footer />
      <FloatingHelpButton />
    </div>
  )
}
