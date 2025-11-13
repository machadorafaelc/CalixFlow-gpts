/**
 * Tipos TypeScript para o Firestore
 * 
 * Define a estrutura de dados do banco
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Usuário do sistema
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

/**
 * Cliente (empresa/projeto)
 */
export interface Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  createdAt: Timestamp;
  createdBy: string; // uid do usuário que criou
  updatedAt: Timestamp;
  documentCount: number; // quantidade de documentos
  conversationCount: number; // quantidade de conversas
}

/**
 * Documento do cliente (manual de marca, briefing, etc)
 */
export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'image';
  size: number; // em bytes
  url: string; // URL no Firebase Storage
  uploadedAt: Timestamp;
  uploadedBy: string; // uid do usuário
  extractedText?: string; // texto extraído (OCR ou parsing)
  embedding?: number[]; // vetor para busca semântica (RAG)
  metadata?: {
    pageCount?: number;
    keywords?: string[];
    summary?: string;
  };
}

/**
 * Conversa com o GPT
 */
export interface Conversation {
  id: string;
  clientId: string;
  userId: string; // dono da conversa
  title: string; // título gerado automaticamente
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
  lastMessage?: string; // preview da última mensagem
}

/**
 * Mensagem individual
 */
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Timestamp;
  
  // Metadados opcionais
  attachments?: MessageAttachment[];
  documentsUsed?: string[]; // IDs dos documentos usados no contexto
  sources?: string[]; // Nomes dos documentos usados como fonte (RAG)
  tokenCount?: number;
  model?: string; // gpt-4o-mini, etc
}

/**
 * Anexo de mensagem
 */
export interface MessageAttachment {
  name: string;
  type: string;
  size: number;
  url?: string; // se foi salvo no Storage
  content?: string; // se foi processado inline
}

/**
 * Configurações do cliente para o GPT
 */
export interface ClientSettings {
  clientId: string;
  systemPrompt?: string; // prompt customizado para este cliente
  temperature?: number; // 0-1, padrão 0.7
  maxTokens?: number; // limite de tokens por resposta
  documentsEnabled: boolean; // se deve usar RAG
  selectedDocuments?: string[]; // IDs dos documentos ativos
  updatedAt: Timestamp;
  updatedBy: string;
}

/**
 * Estatísticas de uso
 */
export interface UsageStats {
  userId: string;
  date: string; // YYYY-MM-DD
  messagesCount: number;
  tokensUsed: number;
  conversationsCreated: number;
  documentsUploaded: number;
}
