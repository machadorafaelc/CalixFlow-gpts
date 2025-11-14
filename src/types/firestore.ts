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
  role: 'super_admin' | 'agency_admin' | 'user';
  agencyId?: string; // null para super_admin
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

/**
 * Agência (organização/tenant)
 */
export interface Agency {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  createdAt: Timestamp;
  createdBy: string; // uid do super_admin
  updatedAt: Timestamp;
  status: 'active' | 'inactive';
  userCount: number;
  gptCount: number;
}

/**
 * GPT (assistente de IA)
 */
export interface GPT {
  id: string;
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  createdAt: Timestamp;
  createdBy: string; // uid do super_admin
  updatedAt: Timestamp;
  isGlobal: boolean; // se true, aparece para todas agências
  model: string; // gpt-4o-mini, etc
}

/**
 * Atribuição de GPT para Agência
 */
export interface GPTAssignment {
  id: string;
  gptId: string;
  agencyId: string;
  assignedAt: Timestamp;
  assignedBy: string; // uid do super_admin
}

/**
 * Cliente (empresa/projeto) - DEPRECATED: usar Agency
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

/**
 * Equipe (Team)
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  createdBy: string; // uid do criador
  updatedAt: Timestamp;
  memberCount: number;
  clientIds: string[]; // IDs dos clientes que a equipe tem acesso
}

/**
 * Membro de Equipe
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string; // uid do usuário
  role: 'admin' | 'editor' | 'viewer';
  addedAt: Timestamp;
  addedBy: string; // uid de quem adicionou
  // Informações do usuário (denormalizadas para facilitar queries)
  userEmail: string;
  userDisplayName?: string;
}

/**
 * Convite de Equipe
 */
export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Timestamp;
  createdBy: string;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
}

/**
 * Resultado da checagem de documentos
 */
export interface DocumentCheckResult {
  overallStatus: 'approved' | 'rejected' | 'warning';
  summary: string;
  comparisons: {
    field: string;
    piValue: string;
    documentValue: string;
    match: boolean;
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
    explanation: string;
  }[];
}
