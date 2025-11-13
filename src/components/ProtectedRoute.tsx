/**
 * Componente de Rota Protegida
 * 
 * Wrapper que protege rotas que requerem autenticação
 * Redireciona para login se o usuário não estiver autenticado
 */

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar fallback (tela de login)
  if (!user) {
    return <>{fallback}</>;
  }

  // Se estiver autenticado, mostrar conteúdo protegido
  return <>{children}</>;
}

export default ProtectedRoute;
