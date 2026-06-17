import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Medicamentos from './pages/Medicamentos/Medicamentos'
import Estoque from './pages/Estoque/Estoque'
import Prescricoes from './pages/Prescricoes/Prescricoes'
import Relatorios from './pages/Relatorios/Relatorios'
import Usuarios from './pages/Usuarios/Usuarios'

function Privado({ children }) {
  const { session } = useAuth()
  return session ? children : <Navigate to="/login" replace />
}

function Publico({ children }) {
  const { session } = useAuth()
  return !session ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Publico><Login /></Publico>} />
          <Route path="/" element={<Privado><Layout /></Privado>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="medicamentos" element={<Medicamentos />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="prescricoes" element={<Prescricoes />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
} 