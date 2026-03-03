import type { KPIs } from '../types'

interface KpiCardsProps {
  kpis: KPIs | null
  loading?: boolean
}

function formatImporte(val: number, decimals = 0) {
  return `${val.toLocaleString('es-ES', { maximumFractionDigits: decimals })} K€`
}

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-[#E5E7EB] rounded w-24 mb-3" />
            <div className="h-8 bg-[#E5E7EB] rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!kpis) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-5 shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-[#4B5563] mb-1">Importe máximo</p>
        <p className="text-2xl font-bold text-[#111827]">
          {formatImporte(kpis.importe_maximo)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-[#4B5563] mb-1">Licitación mayor importe</p>
        <p className="text-lg font-bold text-[#111827] truncate" title={kpis.licitacion_mayor_importe?.titulo}>
          {kpis.licitacion_mayor_importe?.titulo || '-'}
        </p>
        <p className="text-sm text-[#4B5563]">
          {kpis.licitacion_mayor_importe ? formatImporte(kpis.licitacion_mayor_importe.importe) : '-'}
        </p>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-[#4B5563] mb-1">Licitaciones</p>
        <p className="text-2xl font-bold text-[#111827]">
          {kpis.total_filtradas} <span className="text-base font-normal text-[#4B5563]">/ {kpis.total_licitaciones}</span>
        </p>
      </div>
    </div>
  )
}
