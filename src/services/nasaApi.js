import { request } from './api'

// ==========================================
// 1. HEALTH CHECK
// ==========================================
export function fetchHealth() {
  return request({ method: 'GET', url: '/api/health' })
}

// ==========================================
// 2. DATASETS REGISTRY
// ==========================================
export function fetchDatasets(params) {
  // params: { status?: 'implemented' | 'in_development' | 'planned', provider?: string }
  return request({ method: 'GET', url: '/api/datasets', params })
}

export function fetchDatasetById(datasetId) {
  return request({ method: 'GET', url: `/api/datasets/${datasetId}` })
}

// ==========================================
// 3. REGIONS REGISTRY
// ==========================================
export function fetchRegions(params) {
  // params: { category?: string }
  return request({ method: 'GET', url: '/api/regions', params })
}

export function fetchRegionById(regionId) {
  return request({ method: 'GET', url: `/api/regions/${regionId}` })
}

// ==========================================
// 4. ENVIRONMENTAL VARIABLES REGISTRY
// ==========================================
export function fetchVariables(params) {
  // params: { dataset_id?: string, category?: string }
  return request({ method: 'GET', url: '/api/variables', params })
}

export function fetchVariableById(variableId) {
  return request({ method: 'GET', url: `/api/variables/${variableId}` })
}

// ==========================================
// 5. ANALYSIS METHODS REGISTRY
// ==========================================
export function fetchAnalysisMethods(params) {
  // params: { category?: string }
  return request({ method: 'GET', url: '/api/analysis/methods', params })
}

export function fetchAnalysisMethodById(methodId) {
  return request({ method: 'GET', url: `/api/analysis/methods/${methodId}` })
}

// ==========================================
// 6. NASA DATA ACQUISITION & JOBS
// ==========================================
export function previewData(payload) {
  // payload: { dataset_id, variable_id, start_date, end_date, region_id?, bounding_box? }
  return request({ method: 'POST', url: '/api/data/preview', data: payload })
}

export function submitDataRetrieval(payload, options = {}) {
  // payload: { dataset_id, variable_id, start_date, end_date, region_id?, bounding_box? }
  // options: { quality_filter?: boolean }
  return request({
    method: 'POST',
    url: '/api/data/retrieve',
    params: { quality_filter: options.quality_filter !== undefined ? options.quality_filter : true },
    data: payload,
  })
}

export function getJobStatus(jobId) {
  return request({ method: 'GET', url: `/api/data/jobs/${jobId}` })
}

export function getJobResult(jobId) {
  return request({ method: 'GET', url: `/api/data/jobs/${jobId}/result` })
}

/**
 * Polls an asynchronous retrieval job until completed or failed.
 * Supports onProgress callback.
 */
export async function pollJobUntilDone(jobId, onProgress = null, maxAttempts = 60, intervalMs = 2000) {
  let attempts = 0
  while (attempts < maxAttempts) {
    const job = await getJobStatus(jobId)
    if (onProgress) {
      onProgress(job)
    }

    if (job.status === 'completed') {
      const result = await getJobResult(jobId)
      return { job, result }
    }

    if (job.status === 'failed') {
      const err = new Error(job.message || 'NASA data retrieval job failed.')
      err.job = job
      throw err
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
    attempts += 1
  }

  throw new Error('Data retrieval job polling timed out after 120 seconds.')
}

// ==========================================
// 7. STATISTICAL TREND ANALYSIS
// ==========================================
export function runTrendAnalysis(payload) {
  // payload: { job_id?, points?, variable_id?, variable_name?, region_id?, region_name?, original_units?, alpha? }
  return request({ method: 'POST', url: '/api/analysis/run', data: payload })
}

export function compareRegions(payload) {
  // payload: { region_ids: string[], dataset_id: string, variable_id: string, start_date: string, end_date: string, alpha?: number }
  return request({ method: 'POST', url: '/api/analysis/compare', data: payload })
}

// ==========================================
// 8. TIME SERIES AGGREGATION
// ==========================================
export function aggregateTimeSeries(payload) {
  // payload: { job_id?, points?, dataset_id?, variable_id?, original_units?, frequency, statistic }
  return request({ method: 'POST', url: '/api/timeseries/aggregate', data: payload })
}
