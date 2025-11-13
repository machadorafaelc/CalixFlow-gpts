/**
 * Componente de Lista de Conversas
 * 
 * Lista de conversas na sidebar do chat
 */

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Conversation } from '../types/firestore';
import { ConversationService } from '../services/conversationService';

interface ConversationListProps {
  clientId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

export function ConversationList({
  clientId,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  useEffect(() => {
    loadConversations();
  }, [clientId]);
  
  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await ConversationService.listConversations(clientId);
      setConversations(convs);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta conversa?')) return;
    
    try {
      await ConversationService.deleteConversation(conversationId);
      setConversations(convs => convs.filter(c => c.id !== conversationId));
      setMenuOpen(null);
      
      // Se deletou a conversa selecionada, criar nova
      if (conversationId === selectedConversationId) {
        onCreateConversation();
      }
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      alert('Erro ao deletar conversa');
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onCreateConversation}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus size={18} className="mr-2" />
          Nova Conversa
        </Button>
      </div>
      
      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare size={48} className="text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">
              Nenhuma conversa ainda.
              <br />
              Clique em "Nova Conversa" para começar.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="relative group"
              >
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                    selectedConversationId === conversation.id
                      ? 'bg-purple-100 text-purple-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        selectedConversationId === conversation.id
                          ? 'text-purple-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title || 'Nova conversa'}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conversation.lastMessage}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {formatDate(conversation.updatedAt)}
                        </p>
                        {conversation.messageCount > 0 && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <p className="text-xs text-gray-400">
                              {conversation.messageCount} mensagens
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Menu de Ações */}
                <div className="absolute right-2 top-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === conversation.id ? null : conversation.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 transition-opacity ${
                      menuOpen === conversation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <MoreVertical size={14} className="text-gray-500" />
                  </button>
                  
                  {menuOpen === conversation.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                        <button
                          onClick={() => handleDeleteConversation(conversation.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                          Deletar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;
