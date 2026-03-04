export interface Licitacion {
  id: number
  fichero_id?: number
  tipo?: string
  lugar?: string
  organismo?: string
  titulo?: string
  abreviado?: string
  expediente?: string
  fecha_licitacion?: string
  fecha_limite?: string
  hora_limite?: string
  importe: number
  url?: string
  estado_decision?: string
  estado_scraping?: string
  idoneidad_categoria?: string
  idoneidad_score?: number
  interesa?: boolean
  fecha_decision?: string
  notas?: string
  datos_economicos_json?: string
  entregables_json?: string
  riesgos_json?: string
  fecha_scraping?: string
  scraping_error?: string
  has_pliego?: boolean
  fecha_inicio_servicio?: string
  duracion_servicio?: string
  created_at?: string
  updated_at?: string
}

export interface LicitacionListResponse {
  items: Licitacion[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface KPIs {
  importe_maximo: number
  licitacion_mayor_importe?: { titulo: string; importe: number }
  total_licitaciones: number
  total_filtradas: number
}

export interface Config {
  id?: number
  empresa_descripcion: string
  scraping_auto: boolean
  dias_scraping_antiguo: number
  scrapes_concurrentes: number
  gemini_api_key?: string
  gemini_model?: string
  gemini_model_extraction?: string
  calcular_idoneidad_import?: boolean
}

export interface FicheroExcel {
  id: number
  nombre_fichero: string
  fecha_carga?: string
  total_licitaciones: number
}

export interface CalculoIdoneidadResponse {
  expediente: string
  texto_licitacion: string
  descripcion_empresa: string
  resultado_score: number
  resultado_categoria: string
  licitacion: Licitacion
}
