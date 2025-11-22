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

/**
 * PI (Plano de Inserção)
 * 
 * Representa um plano de inserção de mídia que passa por 3 departamentos:
 * Mídia → Checking → Financeiro
 */
export interface PI {
  id: string;
  numero: string; // Número do PI (ex: "60001")
  
  // Relacionamentos
  agencyId: string; // Agência dona do PI
  clientId?: string; // Cliente/GPT associado (opcional)
  
  // Informações da campanha
  cliente: string; // Nome do cliente
  campanha: string;
  meio: 'TV' | 'Rádio' | 'Digital' | 'Impresso' | 'OOH' | 'Cinema';
  veiculo: string; // Nome do veículo (ex: "Globo", "Google Ads")
  
  // Status e workflow
  status: PIStatus;
  departamento: 'midia' | 'checking' | 'financeiro';
  responsavel: string; // Nome do responsável atual
  
  // Valores e datas
  valor: number;
  dataEntrada: Timestamp;
  prazo: Timestamp;
  
  // Metadados
  createdAt: Timestamp;
  createdBy: string; // uid do usuário ou "api" se veio do ERP
  updatedAt: Timestamp;
  updatedBy: string;
  
  // Histórico de mudanças
  historico?: PIHistoryEntry[];
  
  // Dados do ERP (se veio via API)
  erpData?: {
    erpId: string; // ID no sistema ERP
    syncedAt: Timestamp;
    rawData?: any; // Dados originais do ERP
  };
}

/**
 * Status possíveis de um PI
 */
export type PIStatus = 
  | 'checking_analise'           // Checking: Em Análise
  | 'pendente_veiculo'           // Pendente: Veículo
  | 'pendente_midia'             // Pendente: Mídia
  | 'pendente_fiscalizadora'     // Pendente: Fiscalizadora
  | 'aguardando_conformidade'    // Cliente: Aguardando Conformidade
  | 'faturado'                   // FATURADO
  | 'cancelado'                  // PI CANCELADO
  | 'aprovado'                   // Aprovado
  | 'em_producao';               // Em Produção

/**
 * Entrada no histórico de um PI
 */
export interface PIHistoryEntry {
  timestamp: Timestamp;
  userId: string;
  userName: string;
  action: 'created' | 'status_changed' | 'department_changed' | 'assigned' | 'updated' | 'commented';
  description: string;
  oldValue?: any;
  newValue?: any;
}

/**
 * Configuração de status de PI
 */
export interface PIStatusConfig {
  label: string;
  color: string; // Classe Tailwind
  description?: string;
}

/**
 * Comentário em um PI
 */
export interface PIComment {
  id: string;
  piId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: Timestamp;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

/**
 * Filtros para listagem de PIs
 */
export interface PIFilters {
  agencyId?: string;
  clientId?: string;
  departamento?: 'midia' | 'checking' | 'financeiro';
  status?: PIStatus;
  responsavel?: string;
  meio?: string;
  dataInicio?: Date;
  dataFim?: Date;
  searchTerm?: string;
}

/**
 * UserProfile (atualizado com campos do sistema multi-tenant)
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super_admin' | 'agency_admin' | 'user';
  agencyId?: string; // null para super_admin
  departamento?: 'midia' | 'checking' | 'financeiro'; // Departamento do usuário para PIs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
