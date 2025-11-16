/**
 * Grid de Cards de Clientes
 * 
 * Interface visual para seleção de clientes/GPTs
 */

import { useState, useEffect } from 'react';
import { Building2, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { Client } from '../types/firestore';
import { ClientService } from '../services/clientService';
import { getGradientForId, getInitials } from '../utils/colorUtils';

interface ClientCardGridProps {
  onSelectClient: (clientId: string) => void;
}

export function ClientCardGrid({ onSelectClient }: ClientCardGridProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientList = await ClientService.listClients();
      setClients(clientList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              GPTs Cálix
            </h1>
            <p className="text-gray-600 mt-1">
              Selecione um assistente para começar
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map((client, index) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-purple-300 text-left"
            >
              {/* Avatar */}
              <div className={`w-16 h-16 bg-gradient-to-br ${getGradientForId(client.id)} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl font-bold text-white">
                  {getInitials(client.name)}
                </span>
              </div>

              {/* Nome */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                {client.name}
              </h3>

              {/* Descrição */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                {client.description || 'Assistente especializado'}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{client.conversationCount || 0} conversas</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  <span>{client.documentCount || 0} docs</span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                  Iniciar conversa
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Building2 size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum GPT disponível
            </h3>
            <p className="text-gray-500">
              Entre em contato com o administrador para adicionar assistentes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
