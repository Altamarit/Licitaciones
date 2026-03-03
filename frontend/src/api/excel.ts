import { api } from './client'

export const excelApi = {
  import: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ fichero_id: number; nombre: string; total_importadas: number }>('/excel/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ fichero_id: number; nuevas: number; actualizadas: number }>('/excel/update', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  export: (licitacion_ids: number[]) =>
    api.post('/excel/export', { licitacion_ids }, { responseType: 'blob' }),
}
