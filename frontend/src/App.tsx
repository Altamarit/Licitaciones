import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { DetailPage } from './pages/DetailPage'
import { ImportPage } from './pages/ImportPage'
import { UpdatePage } from './pages/UpdatePage'
import { ConfigPage } from './pages/ConfigPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="licitacion/:id" element={<DetailPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="update" element={<UpdatePage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
