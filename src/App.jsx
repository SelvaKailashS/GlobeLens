import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import DataExplorer from './pages/DataExplorer'
import TrendAnalysis from './pages/TrendAnalysis'
import InteractiveMap from './pages/InteractiveMap'
import RegionComparison from './pages/RegionComparison'
import EarthAIAssistant from './pages/EarthAIAssistant'
import Reports from './pages/Reports'
import About from './pages/About'
import { demoAnalysis } from './data/demoData'
import { BackendProvider } from './context/BackendContext'
import { ThemeProvider } from './context/ThemeContext'

function WorkspaceRoutes() {
  const [analysis, setAnalysis] = useState(demoAnalysis)
  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<Dashboard analysis={analysis} />} />
        <Route path="/explorer" element={<DataExplorer onAnalysisReady={setAnalysis} />} />
        <Route path="/map" element={<InteractiveMap onSelectLocation={(loc) => setAnalysis((prev) => ({ ...prev, location: loc.name, coordinates: { lat: loc.lat, lng: loc.lng } }))} />} />
        <Route path="/analysis" element={<TrendAnalysis analysis={analysis} onAnalysisReady={setAnalysis} />} />
        <Route path="/compare" element={<RegionComparison />} />
        <Route path="/assistant" element={<EarthAIAssistant analysis={analysis} />} />
        <Route path="/reports" element={<Reports analysis={analysis} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BackendProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell><Landing /></AppShell>} />
            <Route path="*" element={<WorkspaceRoutes />} />
          </Routes>
        </BrowserRouter>
      </BackendProvider>
    </ThemeProvider>
  )
}
