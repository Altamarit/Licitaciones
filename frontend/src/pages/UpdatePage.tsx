import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { excelApi } from '../api/excel'

export function UpdatePage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Seleccione un archivo Excel o CSV')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await excelApi.update(file)
      navigate('/', { state: { message: `${res.data.nuevas} nuevas, ${res.data.actualizadas} actualizadas` } })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Actualizar desde Excel</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-2">Archivo Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[#4B5563] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#2563EB] file:text-white file:font-medium"
          />
        </div>
        <div className="p-4 bg-[#F5F5F7] rounded-lg text-sm text-[#4B5563]">
          <p>Se actualizarán las licitaciones existentes por N EXPEDIENTE y se añadirán las nuevas. Las notas y decisiones de interés se conservan.</p>
        </div>
        {error && <p className="text-[#DC2626] text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full border border-[#E4E4E7] text-[#4B5563] font-medium hover:bg-[#F5F5F7]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
