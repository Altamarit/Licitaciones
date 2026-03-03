import { Link } from 'react-router-dom'
import type { Licitacion } from '../types'
import { StatusBadge } from './StatusBadge'

interface LicitacionTableProps {
  items: Licitacion[]
  selected: Set<number>
  onSelect: (id: number, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function formatImporte(val: number) {
  const enMiles = val / 1000
  return `${Math.round(enMiles).toLocaleString('es-ES')} K€`
}

function diasHastaCierre(fecha: string | undefined) {
  if (!fecha) return '-'
  const d = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const diff = Math.ceil((d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? `${diff} días` : diff === 0 ? 'Hoy' : 'Cerrada'
}

export function LicitacionTable({
  items,
  selected,
  onSelect,
  onSelectAll,
  page,
  pageSize,
  total,
  onPageChange,
}: LicitacionTableProps) {
  const pages = Math.ceil(total / pageSize) || 1
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))

  return (
    <div className="bg-white rounded-xl shadow-[0_10px_25px_rgba(15,23,42,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F5F5F7] border-b border-[#E4E4E7]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-[#E4E4E7]"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Expediente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Descripción</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[#4B5563]">Importe</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Lugar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Idoneidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Estado decisión</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Scraping</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">F. límite</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563]">Días cierre</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#4B5563]">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((lic) => (
              <tr key={lic.id} className="border-b border-[#E4E4E7] hover:bg-[#F9FAFB]">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lic.id)}
                    onChange={(e) => onSelect(lic.id, e.target.checked)}
                    className="rounded border-[#E4E4E7]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">{lic.expediente || '-'}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#111827] line-clamp-2" title={lic.titulo}>
                    {lic.abreviado || lic.titulo || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-[#111827]">
                  {formatImporte(lic.importe || 0)}
                </td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">{lic.lugar || '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={lic.idoneidad_categoria || ''} variant="idoneidad" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={lic.estado_decision || ''} variant="decision" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={lic.estado_scraping || ''} variant="scraping" />
                </td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">
                  {lic.fecha_limite ? new Date(lic.fecha_limite).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">
                  {diasHastaCierre(lic.fecha_limite)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/licitacion/${lic.id}`}
                    className="inline-flex px-3 py-1.5 rounded-full bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8]"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="py-12 text-center text-[#4B5563]">
          No hay licitaciones. Carga un Excel para comenzar.
        </div>
      )}
      {total > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-[#E4E4E7]">
          <span className="text-sm text-[#4B5563]">
            Filas por página: {pageSize}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-[#E4E4E7] text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-[#4B5563]">
              {page} de {pages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="px-3 py-1 rounded border border-[#E4E4E7] text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
