import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { licitacionesApi, type LicitacionFilters } from '../api/licitaciones'
import { excelApi } from '../api/excel'
import { scrapingApi } from '../api/scraping'
import type { Licitacion, KPIs, FicheroExcel } from '../types'
import { KpiCards } from '../components/KpiCards'
import { FilterPanel } from '../components/FilterPanel'
import { LicitacionTable } from '../components/LicitacionTable'

export function HomePage() {
  const [items, setItems] = useState<Licitacion[]>([])
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [ficheros, setFicheros] = useState<FicheroExcel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [ficheroId, setFicheroId] = useState<number | undefined>()
  const [filterState, setFilterState] = useState<Partial<LicitacionFilters>>({})

  const filters: LicitacionFilters = {
    page,
    page_size: pageSize,
    fichero_id: ficheroId,
    ...filterState,
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [listRes, kpisRes, ficherosRes] = await Promise.all([
        licitacionesApi.list(filters),
        licitacionesApi.kpis(filters),
        licitacionesApi.ficheros(),
      ])
      setItems(listRes.data.items)
      setTotal(listRes.data.total)
      setKpis(kpisRes.data)
      setFicheros(ficherosRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, pageSize, ficheroId, filterState.idoneidad, filterState.estado_decision, filterState.estado_scraping, filterState.interesa, filterState.search])

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilterState((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setFilterState((prev) => ({ ...prev, search: value || undefined }))
    setPage(1)
  }

  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelected(new Set(items.map((i) => i.id)))
    else setSelected(new Set())
  }

  const handleExport = async () => {
    if (selected.size === 0) return
    setExporting(true)
    try {
      const res = await excelApi.export(Array.from(selected))
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'licitaciones_export.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleScrapeSelected = async () => {
    if (selected.size === 0) return
    setScraping(true)
    try {
      await scrapingApi.batch(Array.from(selected))
      setTimeout(fetchData, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setScraping(false)
    }
  }

  const filterPanelState = {
    idoneidad: filterState.idoneidad,
    estado_decision: filterState.estado_decision,
    estado_scraping: filterState.estado_scraping,
    lugar: filterState.lugar,
    interesa: filterState.interesa,
    search: filterState.search,
  }

  return (
    <div>
      {ficheros.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm font-medium text-[#4B5563] mb-2">Últimos ficheros procesados</p>
          <div className="flex flex-wrap gap-2">
            {ficheros.slice(0, 5).map((f) => (
              <button
                key={f.id}
                onClick={() => setFicheroId(ficheroId === f.id ? undefined : f.id)}
                className={`px-3 py-1.5 rounded-full text-sm ${ficheroId === f.id ? 'bg-[#2563EB] text-white' : 'bg-[#E5E7EB] text-[#4B5563]'}`}
              >
                {f.nombre_fichero} ({f.total_licitaciones})
              </button>
            ))}
            {ficheroId && (
              <button
                onClick={() => setFicheroId(undefined)}
                className="px-3 py-1.5 rounded-full text-sm bg-[#FEE2E2] text-[#DC2626]"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
      )}

      <KpiCards kpis={kpis} loading={loading} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <FilterPanel
          filters={filterPanelState}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        <div className="flex gap-2">
          <Link
            to="/import"
            className="px-4 py-2 rounded-full bg-white border border-[#E4E4E7] text-[#111827] text-sm font-medium hover:bg-[#F5F5F7]"
          >
            + Cargar Licitaciones
          </Link>
          <button
            onClick={handleScrapeSelected}
            disabled={selected.size === 0 || scraping}
            className="px-4 py-2 rounded-full bg-white border border-[#E4E4E7] text-[#111827] text-sm font-medium hover:bg-[#F5F5F7] disabled:opacity-50"
          >
            {scraping ? 'Scrapeando...' : 'Scrapear seleccionadas'}
          </button>
          <button
            onClick={handleExport}
            disabled={selected.size === 0 || exporting}
            className="px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : 'Exportar seleccionadas'}
          </button>
        </div>
      </div>

      <LicitacionTable
        items={items}
        selected={selected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  )
}
