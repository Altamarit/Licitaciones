interface FilterPanelProps {
  filters: {
    idoneidad?: string
    estado_decision?: string
    estado_scraping?: string
    lugar?: string
    interesa?: boolean
    search?: string
  }
  onFilterChange: (key: string, value: string | boolean | undefined) => void
  onSearch: (value: string) => void
}

const idoneidadOpts = ['', 'muy alta', 'alta', 'baja', 'muy baja']
const estadoDecisionOpts = ['', 'pendiente revisión idoneidad', 'idoneidad revisada', 'interesa', 'revisada no interesa']
const estadoScrapingOpts = ['', 'scraping_pendiente', 'scraping_en_progreso', 'scraping_ok', 'scraping_parcial', 'scraping_error', 'scraping_antiguo']

export function FilterPanel({ filters, onFilterChange, onSearch }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por título, expediente..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          value={filters.search || ''}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <select
        className="px-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-sm text-[#111827]"
        value={filters.idoneidad || ''}
        onChange={(e) => onFilterChange('idoneidad', e.target.value || undefined)}
      >
        <option value="">Todas idoneidades</option>
        {idoneidadOpts.filter(Boolean).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <select
        className="px-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-sm text-[#111827]"
        value={filters.estado_decision || ''}
        onChange={(e) => onFilterChange('estado_decision', e.target.value || undefined)}
      >
        <option value="">Todos estados decisión</option>
        {estadoDecisionOpts.filter(Boolean).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <select
        className="px-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-sm text-[#111827]"
        value={filters.estado_scraping || ''}
        onChange={(e) => onFilterChange('estado_scraping', e.target.value || undefined)}
      >
        <option value="">Todos scraping</option>
        {estadoScrapingOpts.filter(Boolean).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.interesa === true}
          onChange={(e) => onFilterChange('interesa', e.target.checked ? true : undefined)}
          className="rounded border-[#E4E4E7]"
        />
        <span className="text-sm text-[#4B5563]">Solo interesadas</span>
      </label>
    </div>
  )
}
