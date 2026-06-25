// src/components/ProtectedRoute.jsx
// Guard de rota: verifica auth + profile + empresa ativa

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ── Rota protegida (precisa estar logado + ter profile) ──
export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, profile, isAdmin, companyAtiva } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    // Auth existe mas profile não foi criado (caso de erro)
    return <Navigate to="/setup-error" replace />;
  }

  if (!companyAtiva) {
    return <Navigate to="/empresa-suspensa" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ── Rota pública (se já logado, vai pro dashboard) ──
export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}

// ── Loading screen simples ──
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f4f6fb',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #d0daff',
        borderTopColor: '#4e73c2',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#8a94b0', fontSize: '14px', margin: 0 }}>
        Carregando PharmaTrack...
      </p>
    </div>
  );
}