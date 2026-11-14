import { request } from './api'

export function sendChatMessage(payload) {
  return request({ method: 'POST', url: '/api/ai/chat', data: payload })
}

export function fetchInsights(payload) {
  return request({ method: 'POST', url: '/api/ai/insights', data: payload })
}
