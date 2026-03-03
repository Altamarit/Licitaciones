import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { licitacionesApi } from '../api/licitaciones'
import { scrapingApi } from '../api/scraping'
import { configApi } from '../api/config'
import type { Licitacion } from '../types'
import { StatusBadge } from '../components/StatusBadge'

function formatImporte(val: number, decimals = 2) {
  const enMiles = val / 1000
  return `${enMiles.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} K€`
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const [lic, setLic] = useState<Licitacion | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [pliegoLoading, setPliegoLoading] = useState(false)
  const [, setConfig] = useState<{ scraping_auto?: boolean } | null>(null)

  const licId = id ? parseInt(id, 10) : 0
  const urlValid = lic?.url?.trim().startsWith('http')

  useEffect(() => {
    if (!licId) return
    const load = async () => {
      setLoading(true)
      try {
        const [licRes, configRes] = await Promise.all([
          licitacionesApi.get(licId),
          configApi.get(),
        ])
        setLic(licRes.data)
        setNotes(licRes.data.notas || '')
        setConfig(configRes.data)
        const hasUrl = licRes.data.url?.trim().startsWith('http')
        if (configRes.data?.scraping_auto && !licRes.data.fecha_scraping && hasUrl) {
          setScraping(true)
          try {
            await scrapingApi.scrape(licId)
            const updated = await licitacionesApi.get(licId)
            setLic(updated.data)
          } catch {
            // ignore
          } finally {
            setScraping(false)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [licId])

  const handleScrape = async () => {
    if (!licId || !urlValid) return
    setScraping(true)
    try {
      await scrapingApi.scrape(licId)
      const updated = await licitacionesApi.get(licId)
      setLic(updated.data)
    } catch (e) {
      console.error(e)
    } finally {
      setScraping(false)
    }
  }

  const handleVerPliego = async () => {
    if (!licId) return
    setPliegoLoading(true)
    try {
      const blob = await scrapingApi.getPliegoBlob(licId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e) {
      console.error(e)
    } finally {
      setPliegoLoading(false)
    }
  }

  const handleInteresa = async (value: boolean) => {
    if (!licId) return
    try {
      const res = await licitacionesApi.update(licId, { interesa: value })
      setLic(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleNotas = async (value: string) => {
    if (!licId) return
    try {
      const res = await licitacionesApi.update(licId, { notas: value })
      setLic(res.data)
      setNotes(res.data.notas || '')
    } catch (e) {
      console.error(e)
    }
  }

  const handleIdoneidad = async (value: string) => {
    if (!licId) return
    try {
      const res = await licitacionesApi.update(licId, { idoneidad_categoria: value })
      setLic(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const entregables = lic?.entregables_json ? JSON.parse(lic.entregables_json) : []
  const riesgos = lic?.riesgos_json ? JSON.parse(lic.riesgos_json) : []
  const datosEconomicos = lic?.datos_economicos_json ? JSON.parse(lic.datos_economicos_json) : {}

  if (loading && !lic) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!lic) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4B5563]">Licitación no encontrada</p>
        <Link to="/" className="text-[#2563EB] mt-2 inline-block">Volver a la lista</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">Datos de negocio</h2>
            <div className="space-y-3 text-sm">
              <p className="text-[#111827]"><strong>Descripción:</strong> {lic.titulo || '-'}</p>
              <p><strong>Importe:</strong> {formatImporte(lic.importe || 0)}</p>
              <p><strong>Lugar:</strong> {lic.lugar || '-'}</p>
              <p><strong>Expediente:</strong> {lic.expediente || '-'}</p>
              <p><strong>F. límite ofertas:</strong> {lic.fecha_limite ? new Date(lic.fecha_limite).toLocaleString('es-ES') : '-'}</p>
              <p><strong>F. inicio servicio:</strong> {lic.fecha_inicio_servicio || '-'}</p>
              <p><strong>Duración:</strong> {lic.duracion_servicio || '-'}</p>
              <div className="flex items-center gap-2">
                <strong>Idoneidad:</strong>
                <select
                  value={lic.idoneidad_categoria || ''}
                  onChange={(e) => handleIdoneidad(e.target.value)}
                  className="px-2 py-1 rounded border border-[#E4E4E7]"
                >
                  <option value="muy alta">muy alta</option>
                  <option value="alta">alta</option>
                  <option value="baja">baja</option>
                  <option value="muy baja">muy baja</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <strong>Me interesa:</strong>
                <button
                  onClick={() => handleInteresa(!lic.interesa)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${lic.interesa ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: lic.interesa ? 'calc(100% - 18px)' : '4px' }}
                  />
                </button>
                <span className="text-[#4B5563]">{lic.interesa ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">Scraping y análisis</h2>
            <div className="space-y-3">
              <p>
                <strong>URL:</strong>
                <input
                  type="url"
                  value={lic.url || ''}
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (v !== (lic.url || '')) {
                      licitacionesApi.update(licId, { url: v }).then((r) => setLic(r.data))
                    }
                  }}
                  onChange={(e) => setLic({ ...lic, url: e.target.value })}
                  className="flex-1 px-2 py-1 rounded border border-[#E4E4E7] text-sm w-full mt-1"
                  placeholder="https://..."
                />
                {urlValid && (
                  <a
                    href={lic.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-[#2563EB] text-sm hover:underline"
                  >
                    Abrir URL en nueva pestaña
                  </a>
                )}
              </p>
              <p><strong>Estado scraping:</strong> <StatusBadge label={lic.estado_scraping || ''} /></p>
              {lic.scraping_error && <p className="text-[#DC2626] text-sm">{lic.scraping_error}</p>}
              <button
                onClick={handleScrape}
                disabled={!urlValid || scraping}
                className="px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {scraping ? 'Extrayendo...' : lic.estado_scraping === 'scraping_error' ? 'Reintentar' : 'Scrapear ahora'}
              </button>
              {lic.has_pliego && (
                <button
                  type="button"
                  onClick={handleVerPliego}
                  disabled={pliegoLoading}
                  className="ml-2 text-[#2563EB] text-sm hover:underline disabled:opacity-50"
                >
                  {pliegoLoading ? 'Cargando...' : 'Ver pliego (PDF)'}
                </button>
              )}
              {Object.keys(datosEconomicos).length > 0 && (
                <div className="mt-4 p-3 bg-[#F5F5F7] rounded-lg">
                  <strong>Datos económicos:</strong>
                  <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(datosEconomicos, null, 2)}</pre>
                </div>
              )}
              {riesgos.length > 0 && (
                <div className="mt-4">
                  <strong>Riesgos:</strong>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {riesgos.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {entregables.length > 0 && (
                <div className="mt-4">
                  <strong>Entregables:</strong>
                  <div className="mt-2 max-h-40 overflow-y-auto p-3 bg-[#F5F5F7] rounded-lg text-sm">
                    <ol className="list-decimal list-inside space-y-1">
                      {entregables.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#111827] mb-2">Notas personales</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => handleNotas(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-[#E4E4E7] text-sm min-h-[100px]"
          placeholder="Comentarios, próximos pasos..."
        />
      </div>
    </div>
  )
}
