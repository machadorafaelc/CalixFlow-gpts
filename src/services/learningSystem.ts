/**
 * Learning System
 * 
 * Sistema de aprendizado contínuo que:
 * - Aprende com análises anteriores
 * - Identifica padrões recorrentes
 * - Melhora precisão ao longo do tempo
 * - Sugere correções baseadas em histórico
 */

import { SharedMemory, Pattern } from './sharedMemory';
import { ComparisonResult, FinalReport } from './multiAgentSystem';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface FeedbackEntry {
  analysisId: string;
  timestamp: Date;
  userCorrection?: {
    field: string;
    originalValue: string;
    correctedValue: string;
    reason?: string;
  };
  userRating?: {
    accuracy: number; // 1-5
    usefulness: number; // 1-5
    comments?: string;
  };
  accepted: boolean;
}

export interface LearningInsight {
  type: 'pattern' | 'improvement' | 'suggestion';
  description: string;
  confidence: number;
  examples: any[];
  recommendation?: string;
}

// ============================================================================
// LEARNING SYSTEM
// ============================================================================

export class LearningSystem {
  private memory: SharedMemory;

  constructor(memory: SharedMemory) {
    this.memory = memory;
  }

  /**
   * Aprende com resultado de análise
   */
  async learnFromAnalysis(report: FinalReport): Promise<void> {
    console.log('🎓 Aprendendo com análise...');

    // 1. Armazenar análise na memória de curto prazo
    this.memory.short.store('lastAnalysis', {
      timestamp: new Date(),
      report
    });

    // 2. Identificar padrões de divergências
    const patterns = this.identifyPatterns(report);
    
    // 3. Registrar padrões na memória de longo prazo
    for (const pattern of patterns) {
      await this.memory.long.recordPattern(pattern);
    }

    // 4. Atualizar estatísticas
    await this.updateStats(report);

    console.log(`✅ ${patterns.length} padrões identificados e registrados`);
  }

  /**
   * Identifica padrões de divergências
   */
  private identifyPatterns(report: FinalReport): Array<Omit<Pattern, 'id' | 'frequency' | 'lastSeen'>> {
    const patterns: Array<Omit<Pattern, 'id' | 'frequency' | 'lastSeen'>> = [];

    for (const analysis of report.analyses) {
      for (const comparison of analysis.comparisons) {
        if (!comparison.match && comparison.severity !== 'info') {
          patterns.push({
            field: comparison.field,
            commonIssue: this.categorizeIssue(comparison),
            examples: [{
              piValue: comparison.piValue,
              documentValue: comparison.documentValue,
              correction: comparison.explanation
            }],
            suggestion: this.generateSuggestion(comparison)
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Categoriza tipo de problema
   */
  private categorizeIssue(comparison: ComparisonResult): string {
    const { piValue, documentValue, field } = comparison;

    // Divergência de formatação
    if (this.isSimilarIgnoringFormat(piValue, documentValue)) {
      return `Divergência de formatação em ${field}`;
    }

    // Divergência de valor
    if (field.includes('valor') || field.includes('preco')) {
      return `Divergência de valor em ${field}`;
    }

    // Divergência de data
    if (field.includes('data') || field.includes('periodo')) {
      return `Divergência de data em ${field}`;
    }

    // Divergência de nome/texto
    if (this.isSimilarText(piValue, documentValue)) {
      return `Divergência de nomenclatura em ${field}`;
    }

    return `Divergência em ${field}`;
  }

  /**
   * Verifica se valores são similares ignorando formatação
   */
  private isSimilarIgnoringFormat(val1: string, val2: string): boolean {
    const clean1 = val1.replace(/[^\w]/g, '').toLowerCase();
    const clean2 = val2.replace(/[^\w]/g, '').toLowerCase();
    return clean1 === clean2;
  }

  /**
   * Verifica se textos são similares
   */
  private isSimilarText(val1: string, val2: string): boolean {
    const words1 = val1.toLowerCase().split(/\s+/);
    const words2 = val2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return similarity > 0.6;
  }

  /**
   * Gera sugestão baseada na comparação
   */
  private generateSuggestion(comparison: ComparisonResult): string {
    const { field, piValue, documentValue } = comparison;

    if (this.isSimilarIgnoringFormat(piValue, documentValue)) {
      return `Padronizar formatação de ${field}`;
    }

    if (field.includes('valor')) {
      return `Verificar cálculo de ${field} com departamento financeiro`;
    }

    if (field.includes('data')) {
      return `Confirmar ${field} com cliente`;
    }

    return `Revisar ${field} e atualizar documentação`;
  }

  /**
   * Atualiza estatísticas
   */
  private async updateStats(report: FinalReport): Promise<void> {
    const stats = this.memory.short.retrieve('stats') || {
      totalAnalyses: 0,
      approvedCount: 0,
      rejectedCount: 0,
      warningCount: 0
    };

    stats.totalAnalyses++;
    
    if (report.overallStatus === 'approved') stats.approvedCount++;
    if (report.overallStatus === 'rejected') stats.rejectedCount++;
    if (report.overallStatus === 'warning') stats.warningCount++;

    this.memory.short.store('stats', stats);
  }

  /**
   * Registra feedback do usuário
   */
  async recordFeedback(feedback: FeedbackEntry): Promise<void> {
    console.log('📝 Registrando feedback do usuário...');

    // Armazenar feedback
    await this.memory.long.store({
      type: 'feedback',
      timestamp: feedback.timestamp,
      data: feedback
    });

    // Se usuário corrigiu um valor, aprender com isso
    if (feedback.userCorrection) {
      await this.learnFromCorrection(feedback.userCorrection);
    }

    console.log('✅ Feedback registrado');
  }

  /**
   * Aprende com correção do usuário
   */
  private async learnFromCorrection(correction: FeedbackEntry['userCorrection']): Promise<void> {
    if (!correction) return;

    // Registrar como padrão de correção
    await this.memory.long.recordPattern({
      field: correction.field,
      commonIssue: `Correção frequente em ${correction.field}`,
      examples: [{
        piValue: correction.originalValue,
        documentValue: correction.correctedValue,
        correction: correction.reason
      }],
      suggestion: `Verificar ${correction.field} antes de finalizar`
    });

    // Adicionar à knowledge base se for uma transformação comum
    const normalized = this.memory.kb.normalizeFieldValue(
      correction.field,
      correction.originalValue
    );

    if (normalized === correction.correctedValue) {
      console.log(`💡 Transformação já existe na knowledge base`);
    }
  }

  /**
   * Obtém insights de aprendizado
   */
  async getInsights(limit: number = 10): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // 1. Padrões mais frequentes
    const patterns = await this.memory.long.findPatterns(undefined, 3);
    
    for (const pattern of patterns.slice(0, limit)) {
      insights.push({
        type: 'pattern',
        description: pattern.commonIssue,
        confidence: Math.min(pattern.frequency / 10, 1), // Normaliza para 0-1
        examples: pattern.examples,
        recommendation: pattern.suggestion
      });
    }

    // 2. Melhorias sugeridas baseadas em feedback
    const feedbacks = await this.memory.long.findByType('feedback', 50);
    const corrections = feedbacks
      .map(f => f.data.userCorrection)
      .filter(c => c !== undefined);

    if (corrections.length > 0) {
      insights.push({
        type: 'improvement',
        description: `${corrections.length} correções manuais registradas`,
        confidence: 0.8,
        examples: corrections.slice(0, 5),
        recommendation: 'Considerar adicionar validações automáticas para estes campos'
      });
    }

    // 3. Sugestões baseadas em estatísticas
    const stats = this.memory.short.retrieve('stats');
    if (stats && stats.totalAnalyses > 10) {
      const approvalRate = stats.approvedCount / stats.totalAnalyses;
      
      if (approvalRate < 0.5) {
        insights.push({
          type: 'suggestion',
          description: `Taxa de aprovação baixa (${(approvalRate * 100).toFixed(1)}%)`,
          confidence: 0.9,
          examples: [],
          recommendation: 'Revisar processos de preenchimento de documentos'
        });
      }
    }

    return insights;
  }

  /**
   * Sugere correções baseadas em histórico
   */
  async suggestCorrections(field: string, value: string): Promise<Array<{
    suggestedValue: string;
    confidence: number;
    reason: string;
  }>> {
    const suggestions: Array<{
      suggestedValue: string;
      confidence: number;
      reason: string;
    }> = [];

    // 1. Buscar padrões para este campo
    const patterns = await this.memory.long.findPatterns(field);

    for (const pattern of patterns) {
      for (const example of pattern.examples) {
        if (this.isSimilarText(value, example.piValue)) {
          suggestions.push({
            suggestedValue: example.documentValue,
            confidence: Math.min(pattern.frequency / 10, 0.9),
            reason: `Baseado em ${pattern.frequency} ocorrências similares`
          });
        }
      }
    }

    // 2. Aplicar transformações da knowledge base
    const normalized = this.memory.kb.normalizeFieldValue(field, value);
    if (normalized !== value) {
      suggestions.push({
        suggestedValue: normalized,
        confidence: 1.0,
        reason: 'Normalização padrão da knowledge base'
      });
    }

    // 3. Validar contra regras
    const validationErrors = this.memory.kb.validate(field, value);
    if (validationErrors.length > 0) {
      suggestions.push({
        suggestedValue: value,
        confidence: 0.5,
        reason: `Atenção: ${validationErrors.map(e => e.message).join(', ')}`
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Gera relatório de aprendizado
   */
  async generateLearningReport(): Promise<{
    totalAnalyses: number;
    patterns: Pattern[];
    insights: LearningInsight[];
    stats: any;
  }> {
    const stats = this.memory.short.retrieve('stats') || {
      totalAnalyses: 0,
      approvedCount: 0,
      rejectedCount: 0,
      warningCount: 0
    };

    const patterns = await this.memory.long.findPatterns();
    const insights = await this.getInsights(20);

    return {
      totalAnalyses: stats.totalAnalyses,
      patterns: patterns.slice(0, 10),
      insights,
      stats: {
        ...stats,
        approvalRate: stats.totalAnalyses > 0 
          ? (stats.approvedCount / stats.totalAnalyses * 100).toFixed(1) + '%'
          : 'N/A'
      }
    };
  }
}
