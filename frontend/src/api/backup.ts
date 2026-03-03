import { api } from './client'

export const backupApi = {
  download: () => api.get('/backup/download', { responseType: 'blob' }),
  clearData: () => api.post('/backup/clear-data'),
  restore: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/backup/restore', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
