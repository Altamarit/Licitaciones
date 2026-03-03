import { Link, Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const loc = useLocation()
  const isConfig = loc.pathname === '/config'
  const isImport = loc.pathname === '/import' || loc.pathname === '/update'

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="bg-white border-b border-[#E4E4E7] px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-[#111827]">
          LICITACIONES
        </Link>
        <div className="flex items-center gap-3">
          {!isImport && (
            <>
              <Link
                to="/import"
                className="px-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-[#111827] text-sm font-medium hover:bg-[#F5F5F7]"
              >
                + Cargar Licitaciones
              </Link>
              <Link
                to="/update"
                className="px-4 py-2 rounded-full border border-[#E4E4E7] bg-white text-[#111827] text-sm font-medium hover:bg-[#F5F5F7]"
              >
                + Actualizar Licitaciones
              </Link>
            </>
          )}
          <Link
            to="/config"
            className={`p-2 rounded-full ${isConfig ? 'bg-[#E5E7EB]' : 'hover:bg-[#F5F5F7]'}`}
            title="Configuración"
          >
            <svg className="w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.826 1.37 1.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 2.31-1.37 1.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.826-1.37-1.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 1.37-1.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
