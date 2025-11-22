/**
 * Shared Memory System
 * 
 * Sistema de memória compartilhada entre agentes para:
 * - Contexto persistente
 * - Aprendizado contínuo
 * - Melhoria de precisão
 * - Sugestões inteligentes
 */

import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface MemoryEntry {
  id: string;
  type: 'extraction' | 'comparison' | 'pattern' | 'feedback';
  timestamp: Date;
  data: any;
  metadata?: {
    agencyId?: string;
    userId?: string;
    confidence?: number;
    tags?: string[];
  };
}

export interface Pattern {
  id: string;
  field: string;
  commonIssue: string;
  frequency: number;
  examples: Array<{
    piValue: string;
    documentValue: string;
    correction?: string;
  }>;
  suggestion?: string;
  lastSeen: Date;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  synonyms: string[];
  transformations?: Array<{
    from: string;
    to: string;
  }>;
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  enabled: boolean;
}

export interface LearningData {
  totalAnalyses: number;
  successRate: number;
  commonErrors: Pattern[];
  improvements: Array<{
    date: Date;
    description: string;
    impact: string;
  }>;
}

// ============================================================================
// SHORT-TERM MEMORY (Sessão atual)
// ============================================================================

export class ShortTermMemory {
  private memory: Map<string, any> = new Map();
  private sessionId: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
  }

  /**
   * Armazena dado na memória de curto prazo
   */
  store(key: string, value: any): void {
    this.memory.set(key, {
      value,
      timestamp: new Date(),
      sessionId: this.sessionId
    });
  }

  /**
   * Recupera dado da memória
   */
  retrieve(key: string): any {
    const entry = this.memory.get(key);
    return entry?.value;
  }

  /**
   * Verifica se chave existe
   */
  has(key: string): boolean {
    return this.memory.has(key);
  }

  /**
   * Remove dado da memória
   */
  delete(key: string): void {
    this.memory.delete(key);
  }

  /**
   * Limpa toda a memória
   */
  clear(): void {
    this.memory.clear();
  }

  /**
   * Busca por padrão
   */
  search(pattern: string): any[] {
    const results: any[] = [];
    const regex = new RegExp(pattern, 'i');

    for (const [key, entry] of this.memory.entries()) {
      if (regex.test(key) || regex.test(JSON.stringify(entry.value))) {
        results.push({
          key,
          ...entry
        });
      }
    }

    return results;
  }

  /**
   * Retorna todas as entradas
   */
  getAll(): Map<string, any> {
    return new Map(this.memory);
  }

  /**
   * Retorna estatísticas da memória
   */
  getStats(): {
    size: number;
    sessionId: string;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const timestamps = Array.from(this.memory.values()).map(e => e.timestamp);
    
    return {
      size: this.memory.size,
      sessionId: this.sessionId,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// LONG-TERM MEMORY (Persistente)
// ============================================================================

export class LongTermMemory {
  private agencyId: string;
  private cache: Map<string, MemoryEntry> = new Map();

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  /**
   * Armazena dado na memória de longo prazo (Firestore)
   */
  async store(entry: Omit<MemoryEntry, 'id'>): Promise<string> {
    const id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const memoryEntry: MemoryEntry = {
      id,
      ...entry,
      metadata: {
        ...entry.metadata,
        agencyId: this.agencyId
      }
    };

    await setDoc(doc(db, 'memory', id), {
      ...memoryEntry,
      timestamp: memoryEntry.timestamp.toISOString()
    });

    this.cache.set(id, memoryEntry);
    return id;
  }

  /**
   * Recupera dado da memória
   */
  async retrieve(id: string): Promise<MemoryEntry | null> {
    // Verifica cache primeiro
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // Busca no Firestore
    const docRef = doc(db, 'memory', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const entry: MemoryEntry = {
        ...data,
        timestamp: new Date(data.timestamp)
      } as MemoryEntry;

      this.cache.set(id, entry);
      return entry;
    }

    return null;
  }

  /**
   * Busca entradas por tipo
   */
  async findByType(type: MemoryEntry['type'], limitCount: number = 100): Promise<MemoryEntry[]> {
    const q = query(
      collection(db, 'memory'),
      where('metadata.agencyId', '==', this.agencyId),
      where('type', '==', type),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp)
      } as MemoryEntry;
    });
  }

  /**
   * Busca padrões recorrentes
   */
  async findPatterns(field?: string, minFrequency: number = 3): Promise<Pattern[]> {
    const entries = await this.findByType('pattern');
    
    let patterns = entries
      .map(e => e.data as Pattern)
      .filter(p => p.frequency >= minFrequency);

    if (field) {
      patterns = patterns.filter(p => p.field === field);
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Registra padrão de erro
   */
  async recordPattern(pattern: Omit<Pattern, 'id' | 'frequency' | 'lastSeen'>): Promise<void> {
    // Busca padrão similar existente
    const existingPatterns = await this.findPatterns(pattern.field);
    const similar = existingPatterns.find(p => 
      p.field === pattern.field && 
      p.commonIssue === pattern.commonIssue
    );

    if (similar) {
      // Incrementa frequência
      similar.frequency++;
      similar.lastSeen = new Date();
      similar.examples.push(...pattern.examples);

      await setDoc(doc(db, 'memory', similar.id), {
        type: 'pattern',
        data: similar,
        timestamp: new Date().toISOString(),
        metadata: { agencyId: this.agencyId }
      });
    } else {
      // Cria novo padrão
      await this.store({
        type: 'pattern',
        timestamp: new Date(),
        data: {
          ...pattern,
          id: `pattern_${Date.now()}`,
          frequency: 1,
          lastSeen: new Date()
        } as Pattern
      });
    }
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// KNOWLEDGE BASE
// ============================================================================

export class KnowledgeBase {
  private agencyId: string;
  private fieldMappings: Map<string, FieldMapping> = new Map();
  private validationRules: Map<string, ValidationRule> = new Map();

  constructor(agencyId: string) {
    this.agencyId = agencyId;
    this.initializeDefaults();
  }

  /**
   * Inicializa conhecimento padrão
   */
  private initializeDefaults(): void {
    // Mapeamentos de campos comuns
    this.addFieldMapping({
      sourceField: 'valor_total',
      targetField: 'valor',
      synonyms: ['valor total', 'total', 'valor bruto', 'valor líquido', 'montante'],
      transformations: [
        { from: 'R$ ', to: '' },
        { from: '.', to: '' },
        { from: ',', to: '.' }
      ]
    });

    this.addFieldMapping({
      sourceField: 'cliente',
      targetField: 'razao_social',
      synonyms: ['cliente', 'razão social', 'empresa', 'contratante', 'tomador'],
    });

    this.addFieldMapping({
      sourceField: 'cnpj',
      targetField: 'cnpj',
      synonyms: ['cnpj', 'cpf/cnpj', 'cadastro nacional'],
      transformations: [
        { from: '.', to: '' },
        { from: '/', to: '' },
        { from: '-', to: '' }
      ]
    });

    // Regras de validação
    this.addValidationRule({
      id: 'valor_positivo',
      field: 'valor_total',
      rule: 'value > 0',
      severity: 'critical',
      message: 'Valor total deve ser maior que zero',
      enabled: true
    });

    this.addValidationRule({
      id: 'cnpj_formato',
      field: 'cnpj',
      rule: 'length === 14',
      severity: 'warning',
      message: 'CNPJ deve ter 14 dígitos',
      enabled: true
    });

    this.addValidationRule({
      id: 'data_futura',
      field: 'data_veiculacao',
      rule: 'date >= today',
      severity: 'warning',
      message: 'Data de veiculação não pode ser no passado',
      enabled: true
    });
  }

  /**
   * Adiciona mapeamento de campo
   */
  addFieldMapping(mapping: FieldMapping): void {
    this.fieldMappings.set(mapping.sourceField, mapping);
  }

  /**
   * Obtém mapeamento de campo
   */
  getFieldMapping(field: string): FieldMapping | undefined {
    return this.fieldMappings.get(field);
  }

  /**
   * Encontra campo por sinônimo
   */
  findFieldBySynonym(synonym: string): string | undefined {
    const normalized = synonym.toLowerCase().trim();
    
    for (const [field, mapping] of this.fieldMappings.entries()) {
      if (mapping.synonyms.some(s => s.toLowerCase() === normalized)) {
        return field;
      }
    }
    
    return undefined;
  }

  /**
   * Normaliza valor de campo
   */
  normalizeFieldValue(field: string, value: string): string {
    const mapping = this.getFieldMapping(field);
    
    if (!mapping?.transformations) {
      return value;
    }

    let normalized = value;
    for (const transform of mapping.transformations) {
      normalized = normalized.replace(new RegExp(transform.from, 'g'), transform.to);
    }

    return normalized;
  }

  /**
   * Adiciona regra de validação
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule);
  }

  /**
   * Obtém regras de validação para campo
   */
  getValidationRules(field: string): ValidationRule[] {
    return Array.from(this.validationRules.values())
      .filter(rule => rule.field === field && rule.enabled);
  }

  /**
   * Valida valor contra regras
   */
  validate(field: string, value: any): Array<{ severity: string; message: string }> {
    const rules = this.getValidationRules(field);
    const errors: Array<{ severity: string; message: string }> = [];

    for (const rule of rules) {
      try {
        // Avaliação simples de regras
        const isValid = this.evaluateRule(rule.rule, value);
        
        if (!isValid) {
          errors.push({
            severity: rule.severity,
            message: rule.message
          });
        }
      } catch (error) {
        console.error(`Erro ao validar regra ${rule.id}:`, error);
      }
    }

    return errors;
  }

  /**
   * Avalia regra de validação
   */
  private evaluateRule(rule: string, value: any): boolean {
    // Implementação simples - pode ser expandida
    try {
      if (rule.includes('> 0')) {
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
        return numValue > 0;
      }
      
      if (rule.includes('length === 14')) {
        const cleaned = value.toString().replace(/\D/g, '');
        return cleaned.length === 14;
      }
      
      if (rule.includes('date >= today')) {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }

      return true;
    } catch {
      return true; // Em caso de erro, assume válido
    }
  }

  /**
   * Persiste knowledge base no Firestore
   */
  async save(): Promise<void> {
    await setDoc(doc(db, 'knowledgeBase', this.agencyId), {
      fieldMappings: Array.from(this.fieldMappings.entries()),
      validationRules: Array.from(this.validationRules.entries()),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Carrega knowledge base do Firestore
   */
  async load(): Promise<void> {
    const docRef = doc(db, 'knowledgeBase', this.agencyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      if (data.fieldMappings) {
        this.fieldMappings = new Map(data.fieldMappings);
      }
      
      if (data.validationRules) {
        this.validationRules = new Map(data.validationRules);
      }
    }
  }
}

// ============================================================================
// SHARED MEMORY (Integração)
// ============================================================================

export class SharedMemory {
  private shortTerm: ShortTermMemory;
  private longTerm: LongTermMemory;
  private knowledge: KnowledgeBase;

  constructor(agencyId: string, sessionId?: string) {
    this.shortTerm = new ShortTermMemory(sessionId);
    this.longTerm = new LongTermMemory(agencyId);
    this.knowledge = new KnowledgeBase(agencyId);
  }

  /**
   * Acesso à memória de curto prazo
   */
  get short(): ShortTermMemory {
    return this.shortTerm;
  }

  /**
   * Acesso à memória de longo prazo
   */
  get long(): LongTermMemory {
    return this.longTerm;
  }

  /**
   * Acesso à base de conhecimento
   */
  get kb(): KnowledgeBase {
    return this.knowledge;
  }

  /**
   * Inicializa memória (carrega dados persistentes)
   */
  async initialize(): Promise<void> {
    await this.knowledge.load();
  }

  /**
   * Salva estado atual
   */
  async save(): Promise<void> {
    await this.knowledge.save();
  }

  /**
   * Limpa memória de curto prazo
   */
  clearSession(): void {
    this.shortTerm.clear();
  }

  /**
   * Obtém estatísticas gerais
   */
  getStats(): {
    shortTerm: any;
    longTerm: { cacheSize: number };
  } {
    return {
      shortTerm: this.shortTerm.getStats(),
      longTerm: {
        cacheSize: (this.longTerm as any).cache.size
      }
    };
  }
}
