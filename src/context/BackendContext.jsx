import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchHealth } from '../services/nasaApi'
import { API_BASE_URL } from '../services/api'

const BackendContext = createContext({
  isLive: false,
  checking: true,
  endpoint: API_BASE_URL,
  lastChecked: null,
  healthData: null,
  checkBackend: () => {},
})

export function BackendProvider({ children }) {
  const [isLive, setIsLive] = useState(false)
  const [checking, setChecking] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)
  const [healthData, setHealthData] = useState(null)

  const checkBackend = useCallback(async () => {
    setChecking(true)
    try {
      // Backend health endpoint: GET /api/health
      const data = await fetchHealth()
      if (data && data.status === 'healthy') {
        setIsLive(true)
        setHealthData(data)
      } else {
        setIsLive(false)
        setHealthData(null)
      }
    } catch {
      setIsLive(false)
      setHealthData(null)
    } finally {
      setChecking(false)
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    checkBackend()
    const timer = setInterval(checkBackend, 20000)
    return () => clearInterval(timer)
  }, [checkBackend])

  return (
    <BackendContext.Provider
      value={{
        isLive,
        checking,
        endpoint: API_BASE_URL,
        lastChecked,
        healthData,
        checkBackend,
      }}
    >
      {children}
    </BackendContext.Provider>
  )
}

export function useBackend() {
  return useContext(BackendContext)
}
