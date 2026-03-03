import axios from 'axios'

const API_BASE = '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (r) => r,
  (e) => {
    const msg = e.response?.data?.detail || e.message
    console.error('API Error:', msg)
    return Promise.reject(e)
  }
)
