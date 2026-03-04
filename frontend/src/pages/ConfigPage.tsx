import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { configApi } from '../api/config'
import { backupApi } from '../api/backup'
import type { Config } from '../types'

export function ConfigPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    configApi.get().then((r) => setConfig(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return
    setSaving(true)
    setMessage('')
    try {
      await configApi.update(config)
      navigate('/')
    } catch (e) {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      await configApi.reset()
      const r = await configApi.get()
      setConfig(r.data)
      setMessage('Valores restablecidos')
    } catch {
      setMessage('Error al restablecer')
    }
  }

  const handleBackup = async () => {
    try {
      const res = await backupApi.download()
      const blob = new Blob([res.data], { type: 'application/x-sqlite3' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'licitaciones_backup.db'
      a.click()
      URL.revokeObjectURL(url)
      setMessage('Descarga iniciada')
    } catch {
      setMessage('Error al descargar backup')
    }
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRestoring(true)
    setMessage('')
    try {
      await backupApi.restore(file)
      setMessage('Base de datos restaurada. Recarga la página.')
    } catch {
      setMessage('Error al restaurar')
    } finally {
      setRestoring(false)
      e.target.value = ''
    }
  }

  const handleClearData = async () => {
    if (!confirm('¿Borrar todos los registros importados? La configuración se mantendrá.')) return
    setClearing(true)
    setMessage('')
    try {
      await backupApi.clearData()
      setMessage('Datos borrados. Redirigiendo...')
      setTimeout(() => navigate('/'), 1000)
    } catch {
      setMessage('Error al borrar datos')
    } finally {
      setClearing(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Configuración</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Perfil e IA</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Descripción de la empresa</label>
              <textarea
                value={config.empresa_descripcion}
                onChange={(e) => setConfig({ ...config, empresa_descripcion: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#E4E4E7] text-sm min-h-[100px]"
                placeholder="Describa el perfil de su empresa para el matching con licitaciones..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Gemini API Key</label>
              <input
                type="password"
                value={config.gemini_api_key || ''}
                onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#E4E4E7] text-sm"
                placeholder="Obtener en aistudio.google.com"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.calcular_idoneidad_import ?? true}
                onChange={(e) => setConfig({ ...config, calcular_idoneidad_import: e.target.checked })}
                className="rounded border-[#E4E4E7]"
              />
              <span className="text-sm text-[#4B5563]">Calcular idoneidad durante importación</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Scraping</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.scraping_auto}
                onChange={(e) => setConfig({ ...config, scraping_auto: e.target.checked })}
                className="rounded border-[#E4E4E7]"
              />
              <span className="text-sm text-[#4B5563]">Scraping automático al abrir detalle</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Días hasta scraping antiguo</label>
              <input
                type="number"
                min={1}
                max={365}
                value={config.dias_scraping_antiguo}
                onChange={(e) => setConfig({ ...config, dias_scraping_antiguo: parseInt(e.target.value, 10) || 7 })}
                className="w-24 px-3 py-2 rounded-lg border border-[#E4E4E7] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Scrapes concurrentes máximos</label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.scrapes_concurrentes}
                onChange={(e) => setConfig({ ...config, scrapes_concurrentes: parseInt(e.target.value, 10) || 3 })}
                className="w-24 px-3 py-2 rounded-lg border border-[#E4E4E7] text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Datos / Mantenimiento</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBackup}
                className="px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8]"
              >
                Descargar copia de seguridad
              </button>
              <label className="px-4 py-2 rounded-full border border-[#E4E4E7] text-sm font-medium cursor-pointer hover:bg-[#F5F5F7]">
                {restoring ? 'Restaurando...' : 'Restaurar copia'}
                <input type="file" accept=".db" onChange={handleRestore} className="hidden" disabled={restoring} />
              </label>
              <button
                type="button"
                onClick={handleClearData}
                disabled={clearing}
                className="px-4 py-2 rounded-full bg-[#FEE2E2] text-[#DC2626] text-sm font-medium hover:bg-[#FECACA] disabled:opacity-50"
              >
                {clearing ? 'Borrando...' : 'Borrar datos importados'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-full border border-[#E4E4E7] text-[#4B5563] font-medium hover:bg-[#F5F5F7]"
          >
            Restablecer valores por defecto
          </button>
        </div>
      </form>
    </div>
  )
}
