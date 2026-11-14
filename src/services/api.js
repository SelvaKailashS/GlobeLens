import axios from 'axios'

// Configurable API base URL with fallback to default port 8000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Centralized Axios instance with timeout and JSON headers
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout to accommodate scientific computations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

/**
 * Normalizes HTTP, network, and validation errors into friendly, informative Error instances.
 */
export function normalizeApiError(error) {
  if (error?.response) {
    const status = error.response.status
    const data = error.response.data

    let message = ''
    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (data?.detail?.message) {
      message = data.detail.message
    } else if (data?.message) {
      message = data.message
    } else if (data?.detail && Array.isArray(data.detail)) {
      // Pydantic validation error list
      message = data.detail.map((err) => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ')
    } else {
      message = `Backend responded with HTTP ${status} error.`
    }

    const err = new Error(message)
    err.status = status
    err.data = data
    return err
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    const err = new Error('Request timed out. The scientific computation or NASA retrieval took too long to respond.')
    err.isTimeout = true
    return err
  }

  if (error?.request) {
    const err = new Error('Backend connection unavailable. Please check that FastAPI backend is running on http://localhost:8000.')
    err.isNetwork = true
    return err
  }

  return new Error(error?.message || 'An unexpected scientific service error occurred.')
}

/**
 * Robust wrapper around apiClient.request with optional retries for idempotent/safe requests.
 */
export async function request(config, retries = 0) {
  try {
    const response = await apiClient.request(config)
    // FastAPI returns JSON or 202 status
    return response.data
  } catch (error) {
    // Retry on 5xx server errors or transient connection loss if retries allowed
    const isRetryable = !error.response || (error.response.status >= 500 && error.response.status !== 501)
    if (retries > 0 && isRetryable) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return request(config, retries - 1)
    }
    throw normalizeApiError(error)
  }
}
