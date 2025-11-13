/**
 * Componente de Interface de Chat
 * 
 * Interface principal de chat com mensagens e input
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User, Paperclip, X } from 'lucide-react';
import { Button } from './ui/button';
import { Message } from '../types/firestore';
import { MessageService } from '../services/messageService';
import { ChatService } from '../services/chatService';
import { ConversationService } from '../services/conversationService';
import { useAuth } from '../contexts/AuthContext';
import AttachmentService from '../services/attachmentService';
import PDFService from '../services/pdfService';

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if ((!input.trim() && attachments.length === 0) || loading || !chatService.current) return;
    
    const userMessage = input.trim();
    const userAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    setLoading(true);
    
    try {
      // Processar anexos
      let uploadedAttachments: any[] = [];
      let attachmentContext = '';
      
      if (userAttachments.length > 0) {
        console.log(`Processando ${userAttachments.length} anexo(s)...`);
        
        // Gerar ID temporário para a mensagem
        const tempMessageId = `temp_${Date.now()}`;
        
        // Upload dos arquivos
        uploadedAttachments = await AttachmentService.uploadFiles(
          userAttachments,
          conversationId,
          tempMessageId
        );
        
        // Processar cada anexo
        for (const attachment of uploadedAttachments) {
          if (AttachmentService.isImage(attachment.type)) {
            // Analisar imagem com Vision
            console.log('Analisando imagem:', attachment.name);
            const imageDescription = await chatService.current.analyzeImage(
              attachment.url,
              'Analise esta imagem em detalhes. Se houver TEXTO na imagem, extraia TODO o texto palavra por palavra com precisão (OCR). Descreva também o conteúdo visual da imagem. Formate a resposta assim:\n\n**TEXTO EXTRAÍDO:**\n[todo o texto encontrado]\n\n**DESCRIÇÃO VISUAL:**\n[descrição da imagem]'
            );
            attachmentContext += `\n\n[Imagem: ${attachment.name}]\n${imageDescription}`;
            
          } else if (AttachmentService.isPDF(attachment.type)) {
            // Extrair texto do PDF
            console.log('Extraindo texto do PDF:', attachment.name);
            const pdfText = await PDFService.extractTextFromURL(attachment.url);
            attachmentContext += `\n\n[PDF: ${attachment.name}]\n${pdfText.substring(0, 2000)}...`; // Limitar tamanho
          }
        }
      }
      
      // Combinar mensagem com contexto dos anexos
      const fullMessage = userMessage + attachmentContext;
      
      // Adicionar mensagem do usuário com anexos
      await MessageService.addMessage(
        conversationId,
        'user',
        userMessage || '📎 Anexos enviados',
        {
          attachments: uploadedAttachments
        }
      );
      
      // Incrementar contador de mensagens
      await ConversationService.incrementMessageCount(conversationId);
      
      // Atualizar última mensagem
      await ConversationService.updateLastMessage(conversationId, userMessage || '📎 Anexos');
      
      // Gerar título se for a primeira mensagem do usuário
      const conversation = await ConversationService.getConversation(conversationId);
      if (conversation && conversation.messageCount === 1) {
        const title = await ConversationService.generateTitle(userMessage || 'Anexos enviados');
        await ConversationService.updateConversation(conversationId, { title });
      }
      
      // Preparar histórico de mensagens para OpenAI (usar fullMessage com contexto dos anexos)
      const chatMessages = MessageService.formatMessagesForOpenAI([
        ...messages,
        { role: 'user', content: fullMessage } as Message
      ]);
      
      // Pegar clientId da conversa
      const conv = await ConversationService.getConversation(conversationId);
      const clientId = conv?.clientId || 'brb';
      
      // Enviar para OpenAI com RAG
      const response = await chatService.current.sendMessageWithRAG(
        chatMessages,
        clientId,
        {
          systemPrompt: systemPrompt || ChatService.createSystemPrompt(clientName)
        }
      );
      
      // Adicionar resposta do assistente com fontes
      await MessageService.addMessage(
        conversationId,
        'assistant',
        response.content,
        {
          tokenCount: response.tokenCount,
          model: response.model,
          sources: response.sources || [] // Fallback para array vazio se undefined
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
                  {/* Exibir anexos se houver */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg overflow-hidden ${
                            message.role === 'user' ? 'bg-white/20' : 'bg-white'
                          }`}
                        >
                          {attachment.type.startsWith('image/') ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full max-w-xs rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(attachment.url, '_blank')}
                            />
                          ) : (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 hover:opacity-80 transition-opacity ${
                                message.role === 'user' ? 'text-white' : 'text-gray-700'
                              }`}
                            >
                              <span className="text-lg">
                                {AttachmentService.getFileIcon(attachment.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment.name}
                                </p>
                                <p className={`text-xs ${
                                  message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                                }`}>
                                  {AttachmentService.formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  
                  {/* Exibir fontes se houver */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        📚 Fontes consultadas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white px-2 py-1 rounded border border-gray-300 text-gray-700"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
        {/* Preview de anexos */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-lg">
                  {file.type.startsWith('image/') ? '🖼️' : '📄'}
                </span>
                <span className="text-gray-700 max-w-[150px] truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => {
                    setAttachments(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-3 items-end">
          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setAttachments(prev => [...prev, ...files]);
              // Limpar input para permitir selecionar o mesmo arquivo novamente
              e.target.value = '';
            }}
            className="hidden"
          />
          
          {/* Botão de anexar */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-[52px] px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Anexar arquivo"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          
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
            disabled={(!input.trim() && attachments.length === 0) || loading}
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
