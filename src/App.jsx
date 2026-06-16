import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Medicamentos from './pages/Medicamentos/Medicamentos.jsx'
import Estoque from './pages/Estoque/Estoque.jsx'
import Prescricoes from './pages/Prescricoes/Prescricoes.jsx'
import Relatorios from './pages/Relatorios/Relatorios.jsx'
import Usuarios from './pages/Usuarios/Usuarios.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="medicamentos" element={<Medicamentos />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="prescricoes" element={<Prescricoes />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
