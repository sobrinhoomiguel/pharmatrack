// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'

import Layout       from './components/layout/Layout'
import Login        from './pages/Login/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard/Dashboard'
import Medicamentos from './pages/Medicamentos/Medicamentos'
import Estoque      from './pages/Estoque/Estoque'
import Prescricoes  from './pages/Prescricoes/Prescricoes'
import Relatorios   from './pages/Relatorios/Relatorios'
import Usuarios     from './pages/Usuarios/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Públicas ── */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/cadastro" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          {/* ── Protegidas com Layout ── */}
          <Route path="/" element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard"    element={<Navigate to="/" replace />} />
            <Route path="medicamentos" element={<Medicamentos />} />
            <Route path="estoque"      element={<Estoque />} />
            <Route path="prescricoes"  element={<Prescricoes />} />
            <Route path="relatorios"   element={<Relatorios />} />
            <Route path="usuarios"     element={
              <ProtectedRoute requireAdmin><Usuarios /></ProtectedRoute>
            } />
          </Route>

          {/* ── Fallbacks ── */}
          <Route path="/empresa-suspensa" element={<div>Empresa suspensa. Contate o suporte.</div>} />
          <Route path="/setup-error"      element={<div>Erro de configuração. Contate o suporte.</div>} />
          <Route path="*"                 element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}