import { useState, useRef, useCallback } from 'react'
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
  onCalcularIdoneidad?: (id: number) => void
}

const DEFAULT_WIDTHS: Record<string, number> = {
  checkbox: 50,
  expediente: 140,
  descripcion: 250,
  importe: 100,
  lugar: 120,
  idoneidad: 100,
  estado_decision: 140,
  scraping: 120,
  fecha_limite: 140,
  dias_cierre: 100,
}

function formatImporte(val: number) {
  const enMiles = val / 1000
  return `${enMiles.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} K€`
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
  onCalcularIdoneidad,
}: LicitacionTableProps) {
  const pages = Math.ceil(total / pageSize) || 1
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS)
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null)

  const handleMouseDown = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = { key, startX: e.clientX, startWidth: columnWidths[key] }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return
      const diff = moveEvent.clientX - resizingRef.current.startX
      const newWidth = Math.max(50, resizingRef.current.startWidth + diff)
      setColumnWidths(prev => ({ ...prev, [resizingRef.current!.key]: newWidth }))
    }
    
    const handleMouseUp = () => {
      resizingRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [columnWidths])

  const ResizeHandle = ({ colKey }: { colKey: string }) => (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#2563EB] group-hover:bg-[#E4E4E7]"
      onMouseDown={(e) => handleMouseDown(colKey, e)}
    />
  )

  return (
    <div className="bg-white rounded-xl shadow-[0_10px_25px_rgba(15,23,42,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-[#F5F5F7] border-b border-[#E4E4E7]">
            <tr>
              <th className="px-4 py-3 text-left relative group" style={{ width: columnWidths.checkbox }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-[#E4E4E7]"
                />
                <ResizeHandle colKey="checkbox" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.expediente }}>
                Expediente
                <ResizeHandle colKey="expediente" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.descripcion }}>
                Descripción
                <ResizeHandle colKey="descripcion" />
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.importe }}>
                Importe
                <ResizeHandle colKey="importe" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.lugar }}>
                Lugar
                <ResizeHandle colKey="lugar" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.idoneidad }}>
                Idoneidad
                <ResizeHandle colKey="idoneidad" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.estado_decision }}>
                Estado decisión
                <ResizeHandle colKey="estado_decision" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.scraping }}>
                Scraping
                <ResizeHandle colKey="scraping" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.fecha_limite }}>
                F. límite
                <ResizeHandle colKey="fecha_limite" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#4B5563] relative group" style={{ width: columnWidths.dias_cierre }}>
                Días cierre
                <ResizeHandle colKey="dias_cierre" />
              </th>
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
                <td className="px-4 py-3">
                  <Link
                    to={`/licitacion/${lic.id}`}
                    className="text-sm text-[#2563EB] hover:underline font-medium"
                  >
                    {lic.expediente || '-'}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#111827] line-clamp-2" title={lic.titulo}>
                    {lic.abreviado || lic.titulo || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-[#111827]">
                  {formatImporte(lic.importe || 0)}
                </td>
                <td className="px-4 py-3 text-sm text-[#4B5563] truncate">{lic.lugar || '-'}</td>
                <td className="px-4 py-3">
                  {lic.idoneidad_categoria === 'no calculado' && onCalcularIdoneidad ? (
                    <button
                      onClick={() => onCalcularIdoneidad(lic.id)}
                      className="text-sm text-[#2563EB] hover:underline cursor-pointer bg-transparent border-none p-0"
                      title="Click para calcular idoneidad"
                    >
                      no calculado
                    </button>
                  ) : (
                    <StatusBadge label={lic.idoneidad_categoria || ''} variant="idoneidad" />
                  )}
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
