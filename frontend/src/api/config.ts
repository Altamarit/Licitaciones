import { api } from './client'
import type { Config } from '../types'

export const configApi = {
  get: () => api.get<Config>('/config'),
  update: (data: Partial<Config>) => api.put<Config>('/config', data),
  reset: () => api.post('/config/reset'),
}
