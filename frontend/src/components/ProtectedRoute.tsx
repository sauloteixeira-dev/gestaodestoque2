import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'white' 
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: 'white' 
      }}>
        <h2>⛔ Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <p>Apenas administradores podem acessar esta funcionalidade.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
