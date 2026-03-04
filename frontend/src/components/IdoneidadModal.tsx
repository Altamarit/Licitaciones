import type { CalculoIdoneidadResponse } from '../types'

interface IdoneidadModalProps {
  data: CalculoIdoneidadResponse | null
  loading: boolean
  onClose: () => void
}

export function IdoneidadModal({ data, loading, onClose }: IdoneidadModalProps) {
  if (!data && !loading) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111827]">
            Resultado del Cálculo de Idoneidad
          </h2>
          <button
            onClick={onClose}
            className="text-[#4B5563] hover:text-[#111827] text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full mb-4" />
              <p className="text-[#4B5563]">Calculando idoneidad con IA...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">
                  Expediente
                </label>
                <div className="px-4 py-3 bg-[#F5F5F7] rounded-lg text-[#111827] font-medium">
                  {data.expediente || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">
                  Texto de la licitación enviado al modelo
                </label>
                <div className="px-4 py-3 bg-[#F5F5F7] rounded-lg text-[#111827] text-sm max-h-40 overflow-y-auto">
                  {data.texto_licitacion || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">
                  Descripción de la empresa
                </label>
                <div className="px-4 py-3 bg-[#F5F5F7] rounded-lg text-[#111827] text-sm max-h-40 overflow-y-auto">
                  {data.descripcion_empresa || '-'}
                </div>
              </div>

              <div className="border-t border-[#E4E4E7] pt-4">
                <label className="block text-sm font-medium text-[#4B5563] mb-2">
                  Resultado
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 px-4 py-3 bg-[#F5F5F7] rounded-lg">
                    <span className="text-sm text-[#4B5563]">Categoría: </span>
                    <span className={`font-semibold ${getCategoriaColor(data.resultado_categoria)}`}>
                      {data.resultado_categoria}
                    </span>
                  </div>
                  <div className="flex-1 px-4 py-3 bg-[#F5F5F7] rounded-lg">
                    <span className="text-sm text-[#4B5563]">Score: </span>
                    <span className="font-semibold text-[#111827]">
                      {data.resultado_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-[#E4E4E7] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8]"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

function getCategoriaColor(categoria: string): string {
  switch (categoria.toLowerCase()) {
    case 'muy alta':
      return 'text-[#16A34A]'
    case 'alta':
      return 'text-[#22C55E]'
    case 'baja':
      return 'text-[#F59E0B]'
    case 'muy baja':
      return 'text-[#DC2626]'
    default:
      return 'text-[#4B5563]'
  }
}
