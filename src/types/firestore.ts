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
  photoURL?: string; // URL da foto do usuário
  role: 'super_admin' | 'agency_admin' | 'user';
  agencyId?: string; // null para super_admin
  department?: 'midia' | 'checking' | 'financeiro'; // Departamento do colaborador
  managerId?: string; // UID do gerente responsável (para aprovações)
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
 * Cliente da agência
 */
export interface Client {
  id: string;
  agencyId: string; // Agência dona do cliente
  name: string; // Nome do cliente (ex: "Banco da Amazônia")
  description?: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  piCount: number; // Número de PIs do cliente
}

/**
 * Cargo hierárquico no time
 */
export type TeamRole = 'gerente' | 'supervisor' | 'coordenador' | 'analista';

/**
 * Departamento
 */
export type Department = 'midia' | 'checking' | 'financeiro';

/**
 * Time de um cliente em um departamento específico
 */
export interface Team {
  id: string;
  agencyId: string; // Agência
  clientId: string; // Cliente associado
  department: Department; // Departamento (Mídia, Checking, Financeiro)
  
  // Membros do time por cargo
  members: {
    gerente: string[]; // UIDs dos gerentes
    supervisor: string[]; // UIDs dos supervisores
    coordenador: string[]; // UIDs dos coordenadores
    analista: string[]; // UIDs dos analistas
  };
  
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
}

/**
 * Membro de um time (para facilitar consultas)
 */
export interface TeamMember {
  userId: string;
  teamId: string;
  clientId: string;
  department: Department;
  role: TeamRole;
  addedAt: Timestamp;
  addedBy: string;
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
  responsavelId?: string; // UID do responsável
  responsavelPhoto?: string; // URL da foto do responsável
  
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

/**
 * Plano de Mídia (PM)
 */
export interface PlanoMidia {
  id: string;
  agencyId: string;
  clientId: string;
  cliente: string;
  campanha: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  verba: number;
  distribuicao: DistribuicaoCanal[];
  status: 'rascunho' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  geradoPorIA: boolean;
  confiancaIA?: number; // 0-100
  feedbackUsuario?: 'aprovado' | 'rejeitado' | 'modificado';
}

export interface DistribuicaoCanal {
  canal: 'TV' | 'Internet' | 'Radio' | 'OOH' | 'Jornal' | 'Revista';
  porcentagem: number;
  valor: number;
  veiculos: VeiculoPlano[];
}

export interface VeiculoPlano {
  nome: string;
  formato: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  periodo: {
    inicio: string;
    fim: string;
  };
}

/**
 * Dados de treinamento para IA
 */
export interface PMTrainingData {
  id: string;
  agencyId: string;
  clientId: string;
  cliente: string;
  setor: string;
  verba: number;
  distribuicao: Record<string, number>; // canal -> porcentagem
  performance?: {
    alcance?: number;
    conversao?: number;
    roi?: number;
  };
  createdAt: any;
}

// ============================================
// GESTÃO DE PROJETOS
// ============================================

/**
 * Campanha de um cliente
 */
export interface Campaign {
  id: string;
  agencyId: string; // Agência dona
  clientId: string; // Cliente dono
  name: string; // Nome da campanha
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget?: number; // Orçamento total
  startDate?: Timestamp;
  endDate?: Timestamp;
  members: string[]; // UIDs dos membros atribuídos
  createdBy: string; // UID do criador
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Job (tarefa/projeto) dentro de uma campanha
 */
export interface Job {
  id: string;
  agencyId: string;
  campaignId: string; // Campanha pai
  clientId: string; // Cliente (denormalizado para queries)
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[]; // UIDs dos responsáveis
  dueDate?: Timestamp;
  startDate?: Timestamp;
  completedAt?: Timestamp;
  tags?: string[]; // Tags para organização
  attachments?: string[]; // URLs de arquivos
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Task (subtarefa) dentro de um Job
 */
export interface Task {
  id: string;
  agencyId: string;
  jobId: string; // Job pai
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assignedTo?: string; // UID do responsável
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Time/Equipe
 */
export interface Team {
  id: string;
  agencyId: string;
  name: string; // Nome do time
  description?: string;
  department: 'midia' | 'checking' | 'financeiro' | 'criacao' | 'atendimento' | 'outros';
  leaderId?: string; // UID do líder do time
  members: string[]; // UIDs dos membros
  color?: string; // Cor para identificação visual
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Evento de Pauta (reunião, deadline, etc)
 */
export interface PautaEvent {
  id: string;
  agencyId: string;
  title: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'review' | 'presentation' | 'other';
  date: Timestamp; // Data/hora do evento
  duration?: number; // Duração em minutos
  location?: string; // Local ou link da reunião
  attendees: string[]; // UIDs dos participantes
  relatedTo?: {
    type: 'campaign' | 'job' | 'client';
    id: string;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Comentário (pode ser em Job, Task, Campaign, etc)
 */
export interface Comment {
  id: string;
  agencyId: string;
  relatedTo: {
    type: 'job' | 'task' | 'campaign';
    id: string;
  };
  content: string;
  authorId: string; // UID do autor
  mentions?: string[]; // UIDs mencionados
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Notificação para usuário
 */
export interface Notification {
  id: string;
  userId: string; // UID do destinatário
  agencyId: string;
  type: 'task_assigned' | 'job_updated' | 'comment_mention' | 'deadline_approaching' | 'event_reminder';
  title: string;
  message: string;
  relatedTo?: {
    type: 'job' | 'task' | 'campaign' | 'event';
    id: string;
  };
  read: boolean;
  createdAt: Timestamp;
}

/**
 * Nota Fiscal de Colaborador
 */
export interface NotaFiscal {
  id: string;
  agencyId: string;
  userId: string; // UID do colaborador que enviou
  userEmail: string;
  userDisplayName: string;
  
  // Arquivo
  fileName: string;
  fileUrl: string; // URL do arquivo no Storage
  driveFileId?: string; // ID do arquivo no Google Drive
  driveFolderId?: string; // ID da pasta do colaborador no Drive
  
  // Validação
  status: 'pending' | 'validating' | 'approved' | 'rejected';
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    extractedData?: {
      numero?: string;
      valor?: number;
      data?: string;
      cnpj?: string;
      [key: string]: any;
    };
  };
  
  // Processamento
  processedAt?: Timestamp;
  processedBy?: string; // UID do RH que processou
  rejectionReason?: string;
  
  // Notificações
  emailSent: boolean;
  emailSentAt?: Timestamp;
  rhNotified: boolean;
  
  // Metadados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Configuração de RH por Agência
 */
export interface RHConfig {
  id: string; // Mesmo ID da agência
  agencyId: string;
  rhEmails: string[]; // Lista de emails do RH para notificação
  driveFolderId: string; // ID da pasta raiz no Drive para notas
  emailTemplate?: string; // Template customizado de email
  validationRules?: {
    requiredFields?: string[];
    maxFileSize?: number; // em MB
    allowedFormats?: string[]; // ['pdf', 'jpg', 'png']
    [key: string]: any;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Solicitação de Férias
 */
export interface VacationRequest {
  id: string;
  agencyId: string;
  
  // Solicitante
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userDepartment?: string;
  
  // Período solicitado
  startDate: Timestamp;
  endDate: Timestamp;
  totalDays: number; // Dias úteis (10, 15 ou 20)
  
  // Aprovação
  status: 'pending_manager' | 'approved_manager' | 'rejected_manager' | 'approved_rh' | 'rejected_rh' | 'cancelled';
  
  // Gerente
  managerId?: string;
  managerApprovedAt?: Timestamp;
  managerRejectionReason?: string;
  
  // RH
  rhApprovedBy?: string;
  rhApprovedAt?: Timestamp;
  rhRejectionReason?: string;
  rhNotes?: string;
  
  // Notificações
  managerNotified: boolean;
  rhNotified: boolean;
  userNotified: boolean;
  
  // Metadados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Saldo de Férias do Colaborador
 */
export interface VacationBalance {
  id: string; // Mesmo UID do usuário
  userId: string;
  agencyId: string;
  userEmail: string;
  userDisplayName: string;
  
  // Saldo
  totalDaysPerYear: number; // 30 dias
  daysUsed: number; // Dias já utilizados
  daysRemaining: number; // Dias disponíveis
  
  // Controle de períodos
  periodsUsedThisYear: number; // Máximo 3
  currentYear: number;
  
  // Período aquisitivo
  acquisitionStartDate: Timestamp; // Data de admissão
  acquisitionEndDate: Timestamp; // +12 meses
  
  // Histórico
  lastVacationDate?: Timestamp;
  
  // Metadados
  updatedAt: Timestamp;
}

/**
 * Histórico de Férias (para relatórios)
 */
export interface VacationHistory {
  id: string;
  agencyId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  
  requestId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalDays: number;
  
  approvedBy: string; // UID do gerente
  approvedByName: string;
  approvedAt: Timestamp;
  
  processedByRH: string; // UID do RH
  processedByRHName: string;
  processedAt: Timestamp;
  
  year: number;
  month: number;
  
  createdAt: Timestamp;
}
