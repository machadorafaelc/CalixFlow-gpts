/**
 * View de Chat com GPTs
 * 
 * Interface principal de chat integrada com Firebase e OpenAI
 */

import { useState, useEffect } from 'react';
import { ClientSelector } from './ClientSelector';
import { ConversationList } from './ConversationList';
import { ChatInterface } from './ChatInterface';
import { ConversationService } from '../services/conversationService';
import { ClientService } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types/firestore';

export function GPTsCalixView() {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [key, setKey] = useState(0); // Para forçar re-render
  
  // Carregar cliente selecionado
  useEffect(() => {
    if (selectedClientId) {
      loadClient();
    }
  }, [selectedClientId]);
  
  const loadClient = async () => {
    if (!selectedClientId) return;
    
    try {
      const client = await ClientService.getClient(selectedClientId);
      setSelectedClient(client);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
    }
  };
  
  const handleSelectClient = async (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedConversationId(null);
    
    // Criar nova conversa automaticamente
    if (user) {
      try {
        const conversationId = await ConversationService.createConversation(
          clientId,
          user.uid,
          'Nova conversa'
        );
        setSelectedConversationId(conversationId);
        setKey(k => k + 1); // Forçar re-render da lista
      } catch (error) {
        console.error('Erro ao criar conversa:', error);
      }
    }
  };
  
  const handleCreateConversation = async () => {
    if (!selectedClientId || !user) return;
    
    try {
      const conversationId = await ConversationService.createConversation(
        selectedClientId,
        user.uid,
        'Nova conversa'
      );
      setSelectedConversationId(conversationId);
      setKey(k => k + 1); // Forçar re-render da lista
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      alert('Erro ao criar nova conversa');
    }
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar de Conversas */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Seletor de Cliente */}
        <div className="p-4 border-b border-gray-200">
          <ClientSelector
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
          />
        </div>
        
        {/* Lista de Conversas */}
        {selectedClientId && (
          <ConversationList
            key={key}
            clientId={selectedClientId}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onCreateConversation={handleCreateConversation}
          />
        )}
      </div>
      
      {/* Área de Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversationId && selectedClient ? (
          <ChatInterface
            key={selectedConversationId}
            conversationId={selectedConversationId}
            clientName={selectedClient.name}
            systemPrompt={selectedClient.description}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Bem-vindo ao Chat CalixFlow
              </h2>
              <p className="text-gray-600 mb-6">
                Selecione um cliente para começar uma conversa com IA especializada.
              </p>
              {!selectedClientId && (
                <p className="text-sm text-gray-500">
                  👆 Escolha um cliente no seletor acima
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GPTsCalixView;
