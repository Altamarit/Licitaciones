interface StatusBadgeProps {
  label: string
  variant?: 'decision' | 'scraping' | 'idoneidad' | 'neutral'
}

const variantStyles: Record<string, string> = {
  decision: 'bg-[#E5E7EB] text-[#4B5563]',
  scraping: 'bg-[#DBEAFE] text-[#1D4ED8]',
  idoneidad: 'bg-[#DCFCE7] text-[#16A34A]',
  idoneidad_alta: 'bg-[#DCFCE7] text-[#16A34A]',
  idoneidad_baja: 'bg-[#FEE2E2] text-[#DC2626]',
  neutral: 'bg-[#E5E7EB] text-[#4B5563]',
  error: 'bg-[#FEE2E2] text-[#DC2626]',
  interesa: 'bg-[#DCFCE7] text-[#16A34A]',
  'no interesa': 'bg-[#FEE2E2] text-[#DC2626]',
}

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const key = (label || '').toLowerCase().replace(/\s/g, '_')
  let style: string
  if (variant === 'idoneidad') {
    if (key.includes('muy_alta') || key === 'alta') style = variantStyles.idoneidad_alta
    else if (key.includes('muy_baja') || key === 'baja') style = variantStyles.idoneidad_baja
    else style = variantStyles.neutral
  } else {
    style = variantStyles[variant] ?? variantStyles.neutral
    if (!variantStyles[variant]) {
      if (key.includes('interesa') && !key.includes('no')) style = variantStyles.interesa
      else if (key.includes('error') || key.includes('no interesa')) style = variantStyles.error
      else if (key.includes('scraping_ok') || key.includes('scraping_parcial')) style = variantStyles.idoneidad
    }
  }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label || '-'}
    </span>
  )
}
