import { api } from './client'

export const scrapingApi = {
  scrape: (licitacion_id: number) =>
    api.post<{ status: string; licitacion_id: number }>(`/scraping/${licitacion_id}`),

  batch: (licitacion_ids: number[]) =>
    api.post<{ status: string; count: number }>('/scraping/batch/start', { licitacion_ids }),

  pliegoUrl: (licitacion_id: number) => `/api/scraping/${licitacion_id}/pliego`,

  /** Obtiene el pliego como Blob para abrirlo en nueva pestaña (evita problemas de caché/proxy) */
  getPliegoBlob: async (licitacion_id: number): Promise<Blob> => {
    const res = await api.get(`/scraping/${licitacion_id}/pliego`, { responseType: 'blob' })
    return res.data as Blob
  },
}
