import { api } from './client'
import type { Licitacion, LicitacionListResponse, KPIs, FicheroExcel, CalculoIdoneidadResponse } from '../types'

export interface LicitacionFilters {
  page?: number
  page_size?: number
  idoneidad?: string
  estado_decision?: string
  estado_scraping?: string
  lugar?: string
  importe_min?: number
  interesa?: boolean
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  fichero_id?: number
}

export const licitacionesApi = {
  list: (filters: LicitacionFilters = {}) =>
    api.get<LicitacionListResponse>('/licitaciones', { params: filters }),

  get: (id: number) => api.get<Licitacion>(`/licitaciones/${id}`),

  update: (id: number, data: Partial<Licitacion>) =>
    api.patch<Licitacion>(`/licitaciones/${id}`, data),

  kpis: (filters: Omit<LicitacionFilters, 'page' | 'page_size' | 'sort_by' | 'sort_order'> = {}) =>
    api.get<KPIs>('/licitaciones/kpis', { params: filters }),

  ficheros: () => api.get<FicheroExcel[]>('/licitaciones/ficheros'),

  batchIdoneidad: (licitacion_ids: number[], idoneidad_categoria: string) =>
    api.post('/licitaciones/batch-idoneidad', { licitacion_ids, idoneidad_categoria }),

  calcularIdoneidad: (id: number) =>
    api.post<CalculoIdoneidadResponse>(`/licitaciones/${id}/calcular-idoneidad`),
}
