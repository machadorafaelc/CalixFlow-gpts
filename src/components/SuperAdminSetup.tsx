/**
 * Componente de Configuração Inicial do Super Admin
 * 
 * Aparece apenas para o primeiro usuário (machado.rafaelc@gmail.com)
 * quando ele ainda não tem role configurado
 */

import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { UserService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export function SuperAdminSetup() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSetupSuperAdmin = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Configurar como super_admin
      await UserService.updateUser(user.uid, {
        role: 'super_admin',
        displayName: 'Rafael Machado',
      });

      setSuccess(true);
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao configurar super admin:', error);
      alert('Erro ao configurar super admin. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Só mostrar para o email específico sem role configurado
  if (user?.email !== 'machado.rafaelc@gmail.com' || userProfile?.role) {
    return null;
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configuração Concluída!
          </h2>
          <p className="text-gray-600">
            Você agora é um Super Admin. Recarregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="text-white" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Bem-vindo ao CalixFlow!
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          Você é o primeiro usuário do sistema. Vamos configurar sua conta como <strong>Super Admin</strong> para que você tenha acesso completo à plataforma.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-purple-900 mb-2">Como Super Admin, você poderá:</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Criar e gerenciar agências</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Criar e configurar GPTs personalizados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Atribuir GPTs às agências</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Gerenciar usuários e permissões</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">✓</span>
              <span>Acessar todos os recursos da plataforma</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleSetupSuperAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Configurando...' : 'Configurar como Super Admin'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Email: {user?.email}
        </p>
      </div>
    </div>
  );
}
