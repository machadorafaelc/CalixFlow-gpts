/**
 * Specialized Agents
 * 
 * Agentes especializados para validação, correção e aprendizado
 * Complementam o sistema multi-agente com funcionalidades avançadas
 */

import { SharedMemory } from './sharedMemory';
import { ExtractedData, ComparisonResult } from './multiAgentSystem';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    suggestedFix?: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
  score: number; // 0-100
}

export interface CorrectionSuggestion {
  field: string;
  originalValue: string;
  suggestedValue: string;
  confidence: number; // 0-1
  reason: string;
  source: 'pattern' | 'rule' | 'history' | 'ai';
}

export interface LearningInsight {
  type: 'improvement' | 'pattern' | 'anomaly';
  description: string;
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

// ============================================================================
// VALIDATION AGENT
// ============================================================================

export class ValidationAgent {
  private memory?: SharedMemory;

  constructor(memory?: SharedMemory) {
    this.memory = memory;
  }

  /**
   * Valida dados extraídos de um documento
   */
  async validateExtractedData(
    data: ExtractedData,
    documentType: string
  ): Promise<ValidationResult> {
    console.log(`🔍 [ValidationAgent] Validando ${documentType}...`);

    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    let score = 100;

    // 1. Validar campos obrigatórios
    const requiredFields = this.getRequiredFields(documentType);
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        errors.push({
          field,
          message: `Campo obrigatório "${field}" está vazio`,
          severity: 'critical',
          suggestedFix: 'Verificar documento original'
        });
        score -= 15;
      }
    }

    // 2. Validar formatos
    const formatValidations = await this.validateFormats(data);
    errors.push(...formatValidations.errors);
    warnings.push(...formatValidations.warnings);
    score -= formatValidations.errors.length * 10;
    score -= formatValidations.warnings.length * 5;

    // 3. Validar valores numéricos
    const numericValidations = this.validateNumericValues(data);
    errors.push(...numericValidations.errors);
    warnings.push(...numericValidations.warnings);
    score -= numericValidations.errors.length * 10;

    // 4. Validar datas
    const dateValidations = this.validateDates(data);
    errors.push(...dateValidations.errors);
    warnings.push(...dateValidations.warnings);
    score -= dateValidations.errors.length * 10;

    // 5. Validar com knowledge base (se disponível)
    if (this.memory) {
      const kbValidations = await this.validateWithKnowledgeBase(data);
      errors.push(...kbValidations.errors);
      warnings.push(...kbValidations.warnings);
      score -= kbValidations.errors.length * 5;
    }

    // 6. Validar confiança do OCR
    if (data.confidence !== undefined && data.confidence < 0.7) {
      warnings.push({
        field: 'confidence',
        message: `Confiança do OCR baixa (${(data.confidence * 100).toFixed(0)}%)`,
        suggestion: 'Revisar manualmente os dados extraídos'
      });
      score -= 10;
    }

    const finalScore = Math.max(0, Math.min(100, score));
    const isValid = errors.filter(e => e.severity === 'critical').length === 0;

    console.log(`✅ [ValidationAgent] Validação concluída: ${finalScore}% (${errors.length} erros, ${warnings.length} avisos)`);

    return {
      isValid,
      errors,
      warnings,
      score: finalScore
    };
  }

  /**
   * Retorna campos obrigatórios por tipo de documento
   */
  private getRequiredFields(documentType: string): string[] {
    const fieldMap: Record<string, string[]> = {
      pi: ['numero', 'cliente', 'valor_total', 'data_inicio', 'data_fim'],
      notaFiscal: ['numero_nf', 'valor_total', 'data_emissao', 'cnpj'],
      artigo299: ['numero_protocolo', 'data_protocolo', 'valor'],
      relatorios: ['periodo', 'valor_veiculado']
    };

    return fieldMap[documentType] || [];
  }

  /**
   * Valida formatos de campos
   */
  private async validateFormats(data: ExtractedData): Promise<{
    errors: ValidationResult['errors'];
    warnings: ValidationResult['warnings'];
  }> {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // CNPJ
    if (data.cnpj) {
      const cnpjClean = data.cnpj.replace(/\D/g, '');
      if (cnpjClean.length !== 14) {
        errors.push({
          field: 'cnpj',
          message: 'CNPJ deve ter 14 dígitos',
          severity: 'warning',
          suggestedFix: 'Verificar CNPJ no documento'
        });
      }
    }

    // Email
    if (data.email && !this.isValidEmail(data.email)) {
      warnings.push({
        field: 'email',
        message: 'Formato de email inválido',
        suggestion: 'Verificar email no documento'
      });
    }

    // Telefone
    if (data.telefone) {
      const phoneClean = data.telefone.replace(/\D/g, '');
      if (phoneClean.length < 10 || phoneClean.length > 11) {
        warnings.push({
          field: 'telefone',
          message: 'Telefone deve ter 10 ou 11 dígitos',
          suggestion: 'Verificar telefone no documento'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Valida valores numéricos
   */
  private validateNumericValues(data: ExtractedData): {
    errors: ValidationResult['errors'];
    warnings: ValidationResult['warnings'];
  } {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Valores monetários
    const monetaryFields = ['valor_total', 'valor_liquido', 'valor_bruto', 'valor'];
    for (const field of monetaryFields) {
      if (data[field] !== undefined) {
        const value = parseFloat(String(data[field]).replace(/[^\d.-]/g, ''));
        
        if (isNaN(value)) {
          errors.push({
            field,
            message: `Valor inválido em "${field}"`,
            severity: 'critical',
            suggestedFix: 'Verificar valor no documento'
          });
        } else if (value <= 0) {
          errors.push({
            field,
            message: `Valor em "${field}" deve ser maior que zero`,
            severity: 'warning',
            suggestedFix: 'Verificar se o valor está correto'
          });
        } else if (value > 10000000) {
          warnings.push({
            field,
            message: `Valor muito alto em "${field}" (${value})`,
            suggestion: 'Verificar se não há erro de digitação'
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Valida datas
   */
  private validateDates(data: ExtractedData): {
    errors: ValidationResult['errors'];
    warnings: ValidationResult['warnings'];
  } {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    const dateFields = ['data_inicio', 'data_fim', 'data_emissao', 'data_protocolo', 'data_veiculacao'];
    
    for (const field of dateFields) {
      if (data[field]) {
        const date = new Date(data[field]);
        
        if (isNaN(date.getTime())) {
          errors.push({
            field,
            message: `Data inválida em "${field}"`,
            severity: 'warning',
            suggestedFix: 'Verificar formato da data (DD/MM/YYYY)'
          });
        } else {
          // Verificar se data não é muito antiga ou muito futura
          const now = new Date();
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          const twoYearsAhead = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
          
          if (date < oneYearAgo) {
            warnings.push({
              field,
              message: `Data em "${field}" é muito antiga`,
              suggestion: 'Verificar se a data está correta'
            });
          } else if (date > twoYearsAhead) {
            warnings.push({
              field,
              message: `Data em "${field}" é muito futura`,
              suggestion: 'Verificar se a data está correta'
            });
          }
        }
      }
    }

    // Validar período (data_inicio < data_fim)
    if (data.data_inicio && data.data_fim) {
      const inicio = new Date(data.data_inicio);
      const fim = new Date(data.data_fim);
      
      if (inicio > fim) {
        errors.push({
          field: 'data_fim',
          message: 'Data de fim deve ser posterior à data de início',
          severity: 'critical',
          suggestedFix: 'Verificar datas no documento'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Valida com knowledge base
   */
  private async validateWithKnowledgeBase(data: ExtractedData): Promise<{
    errors: ValidationResult['errors'];
    warnings: ValidationResult['warnings'];
  }> {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    if (!this.memory) return { errors, warnings };

    // Validar cada campo com regras da knowledge base
    for (const [field, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;

      const validationErrors = this.memory.kb.validate(field, value);
      
      for (const error of validationErrors) {
        if (error.severity === 'critical') {
          errors.push({
            field,
            message: error.message,
            severity: 'critical',
            suggestedFix: 'Verificar valor no documento'
          });
        } else {
          warnings.push({
            field,
            message: error.message,
            suggestion: 'Verificar se o valor está correto'
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ============================================================================
// CORRECTION AGENT
// ============================================================================

export class CorrectionAgent {
  private memory?: SharedMemory;

  constructor(memory?: SharedMemory) {
    this.memory = memory;
  }

  /**
   * Sugere correções para divergências encontradas
   */
  async suggestCorrections(
    comparisons: ComparisonResult[]
  ): Promise<CorrectionSuggestion[]> {
    console.log(`🔧 [CorrectionAgent] Analisando ${comparisons.length} divergências...`);

    const suggestions: CorrectionSuggestion[] = [];

    for (const comparison of comparisons) {
      if (comparison.match) continue; // Sem divergência

      // 1. Tentar correção por normalização
      const normalizationSuggestion = await this.suggestNormalization(comparison);
      if (normalizationSuggestion) {
        suggestions.push(normalizationSuggestion);
        continue;
      }

      // 2. Tentar correção por histórico
      if (this.memory) {
        const historySuggestion = await this.suggestFromHistory(comparison);
        if (historySuggestion) {
          suggestions.push(historySuggestion);
          continue;
        }
      }

      // 3. Tentar correção por padrão
      const patternSuggestion = this.suggestFromPattern(comparison);
      if (patternSuggestion) {
        suggestions.push(patternSuggestion);
      }
    }

    console.log(`✅ [CorrectionAgent] ${suggestions.length} sugestões geradas`);

    return suggestions;
  }

  /**
   * Sugere correção por normalização
   */
  private async suggestNormalization(
    comparison: ComparisonResult
  ): Promise<CorrectionSuggestion | null> {
    if (!this.memory) return null;

    const normalized = this.memory.kb.normalizeFieldValue(
      comparison.field,
      comparison.piValue
    );

    if (normalized !== comparison.piValue && normalized === comparison.documentValue) {
      return {
        field: comparison.field,
        originalValue: comparison.piValue,
        suggestedValue: normalized,
        confidence: 1.0,
        reason: 'Normalização automática resolve a divergência',
        source: 'rule'
      };
    }

    return null;
  }

  /**
   * Sugere correção baseada em histórico
   */
  private async suggestFromHistory(
    comparison: ComparisonResult
  ): Promise<CorrectionSuggestion | null> {
    if (!this.memory) return null;

    const patterns = await this.memory.long.findPatterns(comparison.field, 2);
    
    for (const pattern of patterns) {
      for (const example of pattern.examples) {
        if (this.isSimilar(comparison.piValue, example.piValue)) {
          return {
            field: comparison.field,
            originalValue: comparison.piValue,
            suggestedValue: example.documentValue,
            confidence: Math.min(pattern.frequency / 10, 0.9),
            reason: `Baseado em ${pattern.frequency} ocorrências similares`,
            source: 'history'
          };
        }
      }
    }

    return null;
  }

  /**
   * Sugere correção baseada em padrão
   */
  private suggestFromPattern(
    comparison: ComparisonResult
  ): Promise<CorrectionSuggestion | null> {
    // Padrões comuns de correção
    
    // 1. Diferença apenas em formatação
    const piClean = comparison.piValue.replace(/[^\w]/g, '').toLowerCase();
    const docClean = comparison.documentValue.replace(/[^\w]/g, '').toLowerCase();
    
    if (piClean === docClean) {
      return Promise.resolve({
        field: comparison.field,
        originalValue: comparison.piValue,
        suggestedValue: comparison.documentValue,
        confidence: 0.95,
        reason: 'Diferença apenas em formatação',
        source: 'pattern'
      });
    }

    // 2. Diferença em maiúsculas/minúsculas
    if (comparison.piValue.toLowerCase() === comparison.documentValue.toLowerCase()) {
      return Promise.resolve({
        field: comparison.field,
        originalValue: comparison.piValue,
        suggestedValue: comparison.documentValue,
        confidence: 0.9,
        reason: 'Diferença apenas em maiúsculas/minúsculas',
        source: 'pattern'
      });
    }

    // 3. Valores numéricos próximos
    const piNum = parseFloat(comparison.piValue.replace(/[^\d.-]/g, ''));
    const docNum = parseFloat(comparison.documentValue.replace(/[^\d.-]/g, ''));
    
    if (!isNaN(piNum) && !isNaN(docNum)) {
      const diff = Math.abs(piNum - docNum);
      const percentDiff = (diff / Math.max(piNum, docNum)) * 100;
      
      if (percentDiff < 5) {
        return Promise.resolve({
          field: comparison.field,
          originalValue: comparison.piValue,
          suggestedValue: comparison.documentValue,
          confidence: 0.7,
          reason: `Diferença de apenas ${percentDiff.toFixed(1)}%`,
          source: 'pattern'
        });
      }
    }

    return Promise.resolve(null);
  }

  /**
   * Verifica se dois valores são similares
   */
  private isSimilar(val1: string, val2: string): boolean {
    const clean1 = val1.toLowerCase().replace(/[^\w]/g, '');
    const clean2 = val2.toLowerCase().replace(/[^\w]/g, '');
    
    // Levenshtein distance simplificado
    const maxLen = Math.max(clean1.length, clean2.length);
    if (maxLen === 0) return true;
    
    let matches = 0;
    for (let i = 0; i < Math.min(clean1.length, clean2.length); i++) {
      if (clean1[i] === clean2[i]) matches++;
    }
    
    const similarity = matches / maxLen;
    return similarity > 0.8;
  }
}

// ============================================================================
// LEARNING AGENT
// ============================================================================

export class LearningAgent {
  private memory?: SharedMemory;

  constructor(memory?: SharedMemory) {
    this.memory = memory;
  }

  /**
   * Aprende com resultado de validação
   */
  async learnFromValidation(
    validation: ValidationResult,
    documentType: string
  ): Promise<void> {
    if (!this.memory) return;

    console.log(`🎓 [LearningAgent] Aprendendo com validação de ${documentType}...`);

    // Registrar erros comuns como padrões
    for (const error of validation.errors) {
      if (error.severity === 'critical') {
        await this.memory.long.recordPattern({
          field: error.field,
          commonIssue: error.message,
          examples: [{
            piValue: '',
            documentValue: error.suggestedFix || '',
          }]
        });
      }
    }

    console.log(`✅ [LearningAgent] Aprendizado de validação concluído`);
  }

  /**
   * Aprende com correções aplicadas
   */
  async learnFromCorrections(
    corrections: CorrectionSuggestion[],
    applied: boolean[]
  ): Promise<void> {
    if (!this.memory) return;

    console.log(`🎓 [LearningAgent] Aprendendo com ${corrections.length} correções...`);

    for (let i = 0; i < corrections.length; i++) {
      const correction = corrections[i];
      const wasApplied = applied[i];

      if (wasApplied) {
        // Registrar correção bem-sucedida
        await this.memory.long.recordPattern({
          field: correction.field,
          commonIssue: `Correção aplicada: ${correction.reason}`,
          examples: [{
            piValue: correction.originalValue,
            documentValue: correction.suggestedValue,
            correction: correction.reason
          }],
          suggestion: `Aplicar correção automaticamente em casos similares`
        });
      }
    }

    console.log(`✅ [LearningAgent] Aprendizado de correções concluído`);
  }

  /**
   * Gera insights baseados em aprendizado
   */
  async generateInsights(): Promise<LearningInsight[]> {
    if (!this.memory) return [];

    console.log(`🎓 [LearningAgent] Gerando insights...`);

    const insights: LearningInsight[] = [];

    // Buscar padrões mais frequentes
    const patterns = await this.memory.long.findPatterns(undefined, 5);

    for (const pattern of patterns.slice(0, 5)) {
      insights.push({
        type: 'pattern',
        description: `${pattern.commonIssue} (${pattern.frequency} ocorrências)`,
        confidence: Math.min(pattern.frequency / 10, 1),
        actionable: !!pattern.suggestion,
        recommendation: pattern.suggestion
      });
    }

    console.log(`✅ [LearningAgent] ${insights.length} insights gerados`);

    return insights;
  }
}
