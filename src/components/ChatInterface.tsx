/**
 * Componente de Interface de Chat
 * 
 * Interface principal de chat com mensagens e input
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Message } from '../types/firestore';
import { MessageService } from '../services/messageService';
import { ChatService } from '../services/chatService';
import { ConversationService } from '../services/conversationService';
import { useAuth } from '../contexts/AuthContext';

interface ChatInterfaceProps {
  conversationId: string;
  clientName: string;
  systemPrompt?: string;
}

export function ChatInterface({
  conversationId,
  clientName,
  systemPrompt
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = useRef<ChatService | null>(null);
  
  // Inicializar ChatService
  useEffect(() => {
    try {
      chatService.current = new ChatService();
    } catch (error: any) {
      console.error('Erro ao inicializar ChatService:', error);
    }
  }, []);
  
  // Carregar mensagens
  useEffect(() => {
    loadMessages();
    
    // Observar mensagens em tempo real
    const unsubscribe = MessageService.subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      }
    );
    
    return () => unsubscribe();
  }, [conversationId]);
  
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const msgs = await MessageService.listMessages(conversationId);
      setMessages(msgs);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || loading || !chatService.current) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    try {
      // Adicionar mensagem do usuário
      await MessageService.addMessage(conversationId, 'user', userMessage);
      
      // Incrementar contador de mensagens
      await ConversationService.incrementMessageCount(conversationId);
      
      // Atualizar última mensagem
      await ConversationService.updateLastMessage(conversationId, userMessage);
      
      // Gerar título se for a primeira mensagem
      if (messages.length === 0) {
        const title = await ConversationService.generateTitle(userMessage);
        await ConversationService.updateConversation(conversationId, { title });
      }
      
      // Preparar histórico de mensagens para OpenAI
      const chatMessages = MessageService.formatMessagesForOpenAI([
        ...messages,
        { role: 'user', content: userMessage } as Message
      ]);
      
      // Enviar para OpenAI
      const response = await chatService.current.sendMessage(chatMessages, {
        systemPrompt: systemPrompt || ChatService.createSystemPrompt(clientName)
      });
      
      // Adicionar resposta do assistente
      await MessageService.addMessage(
        conversationId,
        'assistant',
        response.content,
        {
          tokenCount: response.tokenCount,
          model: response.model
        }
      );
      
      // Incrementar contador novamente
      await ConversationService.incrementMessageCount(conversationId);
      
      // Atualizar última mensagem
      await ConversationService.updateLastMessage(conversationId, response.content);
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Adicionar mensagem de erro
      await MessageService.addMessage(
        conversationId,
        'system',
        `Erro: ${error.message || 'Não foi possível enviar a mensagem'}`
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
              <Bot size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Olá! Como posso ajudar?
            </h3>
            <p className="text-gray-600 max-w-md">
              Faça perguntas sobre {clientName} ou peça ajuda com qualquer assunto relacionado.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      : message.role === 'system'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-purple-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Área de Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[52px] max-h-32"
            rows={1}
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="h-[52px] px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
