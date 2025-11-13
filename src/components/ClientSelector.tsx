/**
 * Componente de Seleção de Cliente
 * 
 * Permite selecionar qual cliente usar no chat
 */

import { useState, useEffect } from 'react';
import { Building2, Plus, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Client } from '../types/firestore';
import { ClientService } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onCreateClient?: () => void;
}

export function ClientSelector({
  selectedClientId,
  onSelectClient,
  onCreateClient
}: ClientSelectorProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Carregar clientes
  useEffect(() => {
    loadClients();
  }, []);
  
  const loadClients = async () => {
    try {
      setLoading(true);
      const clientList = await ClientService.listClients();
      setClients(clientList);
      
      // Selecionar primeiro cliente automaticamente se não tiver nenhum selecionado
      if (!selectedClientId && clientList.length > 0) {
        onSelectClient(clientList[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectClient = (clientId: string) => {
    onSelectClient(clientId);
    setIsOpen(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Carregando clientes...</span>
      </div>
    );
  }
  
  if (clients.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 size={18} />
          <span className="text-sm">Nenhum cliente cadastrado</span>
        </div>
        {onCreateClient && (
          <Button
            onClick={onCreateClient}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Criar Primeiro Cliente
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Botão de Seleção */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {selectedClient?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedClient?.name || 'Selecione um cliente'}
            </p>
            {selectedClient?.description && (
              <p className="text-xs text-gray-500 truncate">
                {selectedClient.description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown de Clientes */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Lista de Clientes */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {client.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {client.name}
                  </p>
                  {client.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {client.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {client.conversationCount || 0} conversas • {client.documentCount || 0} documentos
                  </p>
                </div>
                {selectedClientId === client.id && (
                  <Check size={18} className="text-purple-600 flex-shrink-0" />
                )}
              </button>
            ))}
            
            {/* Botão Criar Novo Cliente */}
            {onCreateClient && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateClient();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-t border-gray-200 text-purple-600"
              >
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center flex-shrink-0">
                  <Plus size={18} />
                </div>
                <span className="text-sm font-medium">Criar Novo Cliente</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ClientSelector;
