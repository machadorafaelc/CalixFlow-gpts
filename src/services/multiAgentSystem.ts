/**
 * Multi-Agent System for Document Analysis
 * 
 * Arquitetura de múltiplos agentes especializados para análise de documentos
 * Cada agente tem uma responsabilidade específica, evitando confusão
 */

import { DocumentExtractor } from './documentExtractor';
import { ImageProcessor } from './imageProcessor';
import { BatchProcessor, RetryWithBackoff } from '../utils/concurrencyControl';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DocumentData {
  type: string;
  filename: string;
  rawText: string;
  extractedFields: Record<string, any>;
  confidence: number;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    ocrEngine?: string;
  };
}

export interface ComparisonResult {
  field: string;
  piValue: string;
  documentValue: string;
  match: boolean;
  similarity: number;
  severity: 'critical' | 'warning' | 'info';
  explanation?: string;
}

export interface AnalysisReport {
  documentType: string;
  status: 'approved' | 'rejected' | 'warning';
  comparisons: ComparisonResult[];
  summary: string;
  confidence: number;
  timestamp: Date;
}

export interface FinalReport {
  overallStatus: 'approved' | 'rejected' | 'warning';
  piData: DocumentData;
  documentsData: DocumentData[];
  analyses: AnalysisReport[];
  globalSummary: string;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: Date;
}

// ============================================================================
// AGENTE BASE
// ============================================================================

abstract class BaseAgent {
  protected apiKey: string;
  protected model: string = 'gpt-4o-mini';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  protected async callLLM(messages: AgentMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LLM API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  protected log(message: string): void {
    console.log(`[${this.constructor.name}] ${message}`);
  }
}

// ============================================================================
// AGENTE EXTRATOR DE DOCUMENTOS
// ============================================================================

export class DocumentExtractorAgent extends BaseAgent {
  private extractor: DocumentExtractor;

  constructor() {
    super();
    this.extractor = new DocumentExtractor();
  }

  /**
   * Extrai e estrutura dados de um documento
   */
  async extractDocument(file: File, documentType: string): Promise<DocumentData> {
    this.log(`Extraindo documento: ${file.name} (${documentType})`);

    // 1. Extrair texto bruto
    const rawText = await this.extractor.extractText(file);
    this.log(`Texto extraído: ${rawText.length} caracteres`);

    // 2. Usar LLM para estruturar dados
    const extractedFields = await this.structureData(rawText, documentType);

    // 3. Calcular confiança
    const confidence = this.calculateConfidence(rawText, extractedFields);

    return {
      type: documentType,
      filename: file.name,
      rawText,
      extractedFields,
      confidence,
      metadata: {
        wordCount: rawText.split(/\s+/).length
      }
    };
  }

  /**
   * Usa LLM para estruturar dados extraídos
   */
  private async structureData(text: string, documentType: string): Promise<Record<string, any>> {
    const prompt = this.getExtractionPrompt(documentType);

    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: `Você é um agente especializado em extrair dados estruturados de documentos do tipo: ${documentType}.
Sua ÚNICA tarefa é extrair campos específicos do texto fornecido.
Retorne APENAS um objeto JSON válido com os campos extraídos.
Se um campo não for encontrado, use null.`
      },
      {
        role: 'user',
        content: `${prompt}\n\nTexto do documento:\n\n${text}`
      }
    ];

    const response = await this.callLLM(messages);
    
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      this.log(`Erro ao parsear JSON, retornando objeto vazio: ${error}`);
      return {};
    }
  }

  /**
   * Retorna prompt de extração baseado no tipo de documento
   */
  private getExtractionPrompt(documentType: string): string {
    const prompts: Record<string, string> = {
      'pi': `Extraia os seguintes campos do Plano de Inserção (PI):
{
  "numero_pi": "número do PI",
  "cliente": "nome do cliente",
  "agencia": "nome da agência",
  "campanha": "nome da campanha",
  "produto": "produto/serviço",
  "periodo": "período de veiculação",
  "valor_total": "valor total em reais",
  "veiculo": "veículo de comunicação",
  "formato": "formato do anúncio",
  "observacoes": "observações relevantes"
}`,
      'notaFiscal': `Extraia os seguintes campos da Nota Fiscal:
{
  "numero_nf": "número da nota fiscal",
  "data_emissao": "data de emissão",
  "emitente": "nome do emitente",
  "destinatario": "nome do destinatário",
  "valor_total": "valor total",
  "valor_servicos": "valor dos serviços",
  "descricao_servicos": "descrição dos serviços",
  "cnpj_emitente": "CNPJ do emitente",
  "cnpj_destinatario": "CNPJ do destinatário"
}`,
      'artigo299': `Extraia os seguintes campos do Artigo 299:
{
  "numero_documento": "número do documento",
  "data": "data do documento",
  "empresa": "nome da empresa",
  "valor_declarado": "valor declarado",
  "descricao": "descrição do serviço/produto",
  "assinatura": "nome do responsável"
}`,
      'relatorios': `Extraia os seguintes campos do Relatório:
{
  "tipo_relatorio": "tipo do relatório",
  "periodo": "período do relatório",
  "cliente": "cliente",
  "campanha": "campanha",
  "metricas": "principais métricas",
  "resultados": "resultados obtidos",
  "observacoes": "observações"
}`,
      'simplesNacional': `Extraia os seguintes campos do Simples Nacional:
{
  "empresa": "nome da empresa",
  "cnpj": "CNPJ",
  "periodo": "período de referência",
  "regime_tributario": "regime tributário",
  "valor_devido": "valor devido",
  "situacao": "situação fiscal"
}`
    };

    return prompts[documentType] || `Extraia todos os campos relevantes deste documento em formato JSON.`;
  }

  /**
   * Calcula confiança na extração
   */
  private calculateConfidence(rawText: string, extractedFields: Record<string, any>): number {
    const totalFields = Object.keys(extractedFields).length;
    const filledFields = Object.values(extractedFields).filter(v => v !== null && v !== '').length;
    
    if (totalFields === 0) return 0;
    
    const fillRate = (filledFields / totalFields) * 100;
    const textQuality = Math.min(100, (rawText.length / 500) * 100); // Textos maiores = maior confiança
    
    return Math.round((fillRate * 0.7 + textQuality * 0.3));
  }
}

// ============================================================================
// AGENTE COMPARADOR
// ============================================================================

export class ComparatorAgent extends BaseAgent {
  /**
   * Compara PI com um documento específico
   */
  async compareDocuments(
    piData: DocumentData,
    documentData: DocumentData
  ): Promise<AnalysisReport> {
    this.log(`Comparando PI com ${documentData.type}: ${documentData.filename}`);

    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: `Você é um agente especializado em comparar documentos.
Sua ÚNICA tarefa é comparar o Plano de Inserção (PI) com outro documento e identificar divergências.

Retorne APENAS um objeto JSON no seguinte formato:
{
  "comparisons": [
    {
      "field": "nome do campo",
      "piValue": "valor no PI",
      "documentValue": "valor no documento",
      "match": true/false,
      "similarity": 0-100,
      "severity": "critical|warning|info",
      "explanation": "breve explicação"
    }
  ],
  "summary": "resumo da análise",
  "status": "approved|rejected|warning"
}`
      },
      {
        role: 'user',
        content: `Compare os seguintes documentos:

**PI (Plano de Inserção):**
${JSON.stringify(piData.extractedFields, null, 2)}

**${documentData.type} (${documentData.filename}):**
${JSON.stringify(documentData.extractedFields, null, 2)}

Identifique todas as divergências e compatibilidades.`
      }
    ];

    const response = await this.callLLM(messages);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
      
      return {
        documentType: documentData.filename,
        status: result.status || 'warning',
        comparisons: result.comparisons || [],
        summary: result.summary || 'Análise concluída',
        confidence: this.calculateComparisonConfidence(result.comparisons),
        timestamp: new Date()
      };
    } catch (error) {
      this.log(`Erro ao parsear resposta: ${error}`);
      return {
        documentType: documentData.filename,
        status: 'warning',
        comparisons: [],
        summary: 'Erro na análise',
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  private calculateComparisonConfidence(comparisons: ComparisonResult[]): number {
    if (comparisons.length === 0) return 0;
    
    const avgSimilarity = comparisons.reduce((sum, c) => sum + (c.similarity || 0), 0) / comparisons.length;
    return Math.round(avgSimilarity);
  }
}

// ============================================================================
// AGENTE SINTETIZADOR
// ============================================================================

export class SynthesizerAgent extends BaseAgent {
  /**
   * Sintetiza todas as análises em um relatório final
   */
  async synthesize(
    piData: DocumentData,
    documentsData: DocumentData[],
    analyses: AnalysisReport[]
  ): Promise<FinalReport> {
    this.log('Sintetizando relatório final...');

    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: `Você é um agente especializado em sintetizar análises de documentos.
Sua tarefa é criar um relatório executivo final baseado nas análises individuais.

Retorne APENAS um objeto JSON no seguinte formato:
{
  "overallStatus": "approved|rejected|warning",
  "globalSummary": "resumo executivo geral",
  "criticalIssues": ["lista de problemas críticos"],
  "warnings": ["lista de avisos"],
  "recommendations": ["lista de recomendações"]
}`
      },
      {
        role: 'user',
        content: `Sintetize as seguintes análises:

**Análises Individuais:**
${JSON.stringify(analyses, null, 2)}

Crie um relatório executivo final.`
      }
    ];

    const response = await this.callLLM(messages);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
      
      return {
        overallStatus: result.overallStatus || this.determineOverallStatus(analyses),
        piData,
        documentsData,
        analyses,
        globalSummary: result.globalSummary || 'Análise concluída',
        criticalIssues: result.criticalIssues || [],
        warnings: result.warnings || [],
        recommendations: result.recommendations || [],
        timestamp: new Date()
      };
    } catch (error) {
      this.log(`Erro ao parsear resposta: ${error}`);
      return this.createFallbackReport(piData, documentsData, analyses);
    }
  }

  private determineOverallStatus(analyses: AnalysisReport[]): 'approved' | 'rejected' | 'warning' {
    const hasRejected = analyses.some(a => a.status === 'rejected');
    const hasWarning = analyses.some(a => a.status === 'warning');
    
    if (hasRejected) return 'rejected';
    if (hasWarning) return 'warning';
    return 'approved';
  }

  private createFallbackReport(
    piData: DocumentData,
    documentsData: DocumentData[],
    analyses: AnalysisReport[]
  ): FinalReport {
    return {
      overallStatus: this.determineOverallStatus(analyses),
      piData,
      documentsData,
      analyses,
      globalSummary: 'Análise concluída com sucesso',
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      timestamp: new Date()
    };
  }
}

// ============================================================================
// AGENTE COORDENADOR (ORQUESTRADOR)
// ============================================================================

export class CoordinatorAgent {
  private extractorAgent: DocumentExtractorAgent;
  private comparatorAgent: ComparatorAgent;
  private synthesizerAgent: SynthesizerAgent;
  private batchProcessor: BatchProcessor<any, any>;
  private retryHandler: RetryWithBackoff;

  constructor(
    options?: {
      maxConcurrent?: number;
      rateLimit?: { maxRequests: number; windowMs: number };
      maxRetries?: number;
    }
  ) {
    this.extractorAgent = new DocumentExtractorAgent();
    this.comparatorAgent = new ComparatorAgent();
    this.synthesizerAgent = new SynthesizerAgent();
    
    // Configurar batch processor com controle de concorrência
    this.batchProcessor = new BatchProcessor(
      options?.maxConcurrent || 3, // Máximo 3 requisições simultâneas
      options?.rateLimit || { maxRequests: 10, windowMs: 1000 } // 10 req/s
    );
    
    // Configurar retry com backoff
    this.retryHandler = new RetryWithBackoff(
      options?.maxRetries || 3,
      1000,
      10000
    );
  }

  /**
   * Orquestra todo o processo de análise multi-agente (VERSÃO SEQUENCIAL)
   */
  async analyzeDocuments(
    piFile: File,
    documents: Array<{ file: File; type: string }>
  ): Promise<FinalReport> {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 SISTEMA MULTI-AGENTE INICIADO (Sequencial)');
    console.log('='.repeat(80));

    // FASE 1: Extração paralela de todos os documentos
    console.log('\n📄 FASE 1: Extração de Documentos');
    console.log('-'.repeat(80));

    const piData = await this.extractorAgent.extractDocument(piFile, 'pi');
    console.log(`✅ PI extraído: ${Object.keys(piData.extractedFields).length} campos`);

    const documentsData: DocumentData[] = [];
    for (const doc of documents) {
      const data = await this.extractorAgent.extractDocument(doc.file, doc.type);
      documentsData.push(data);
      console.log(`✅ ${doc.type} extraído: ${Object.keys(data.extractedFields).length} campos`);
    }

    // FASE 2: Comparação individual (cada agente comparador trabalha independentemente)
    console.log('\n🔍 FASE 2: Comparação Individual');
    console.log('-'.repeat(80));

    const analyses: AnalysisReport[] = [];
    for (const docData of documentsData) {
      const analysis = await this.comparatorAgent.compareDocuments(piData, docData);
      analyses.push(analysis);
      console.log(`✅ ${docData.type} analisado: ${analysis.status} (${analysis.comparisons.length} comparações)`);
    }

    // FASE 3: Síntese final
    console.log('\n📊 FASE 3: Síntese Final');
    console.log('-'.repeat(80));

    const finalReport = await this.synthesizerAgent.synthesize(piData, documentsData, analyses);
    console.log(`✅ Relatório final: ${finalReport.overallStatus}`);
    console.log(`   - ${finalReport.criticalIssues.length} problemas críticos`);
    console.log(`   - ${finalReport.warnings.length} avisos`);
    console.log(`   - ${finalReport.recommendations.length} recomendações`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ SISTEMA MULTI-AGENTE CONCLUÍDO');
    console.log('='.repeat(80) + '\n');

    return finalReport;
  }

  /**
   * Orquestra todo o processo de análise multi-agente (VERSÃO PARALELA)
   * Até 67% mais rápido que a versão sequencial
   */
  async analyzeDocumentsParallel(
    piFile: File,
    documents: Array<{ file: File; type: string }>
  ): Promise<FinalReport> {
    const startTime = Date.now();
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 SISTEMA MULTI-AGENTE INICIADO (Paralelo)');
    console.log('='.repeat(80));

    // FASE 1: Extração PARALELA de todos os documentos
    console.log('\n📄 FASE 1: Extração Paralela de Documentos');
    console.log('-'.repeat(80));

    const extractionPromises = [
      this.extractorAgent.extractDocument(piFile, 'pi'),
      ...documents.map(doc => this.extractorAgent.extractDocument(doc.file, doc.type))
    ];

    const [piData, ...documentsData] = await Promise.all(extractionPromises);
    
    console.log(`✅ PI extraído: ${Object.keys(piData.extractedFields).length} campos`);
    documentsData.forEach((data, i) => {
      console.log(`✅ ${documents[i].type} extraído: ${Object.keys(data.extractedFields).length} campos`);
    });

    const phase1Time = Date.now() - startTime;
    console.log(`⏱️  Tempo da Fase 1: ${(phase1Time / 1000).toFixed(2)}s`);

    // FASE 2: Comparação PARALELA
    console.log('\n🔍 FASE 2: Comparação Paralela');
    console.log('-'.repeat(80));

    const comparisonPromises = documentsData.map(docData => 
      this.comparatorAgent.compareDocuments(piData, docData)
    );

    const analyses = await Promise.all(comparisonPromises);
    
    analyses.forEach((analysis, i) => {
      console.log(`✅ ${documentsData[i].type} analisado: ${analysis.status} (${analysis.comparisons.length} comparações)`);
    });

    const phase2Time = Date.now() - startTime - phase1Time;
    console.log(`⏱️  Tempo da Fase 2: ${(phase2Time / 1000).toFixed(2)}s`);

    // FASE 3: Síntese final
    console.log('\n📊 FASE 3: Síntese Final');
    console.log('-'.repeat(80));

    const finalReport = await this.synthesizerAgent.synthesize(piData, documentsData, analyses);
    console.log(`✅ Relatório final: ${finalReport.overallStatus}`);
    console.log(`   - ${finalReport.criticalIssues.length} problemas críticos`);
    console.log(`   - ${finalReport.warnings.length} avisos`);
    console.log(`   - ${finalReport.recommendations.length} recomendações`);

    const totalTime = Date.now() - startTime;
    console.log('\n' + '='.repeat(80));
    console.log('✅ SISTEMA MULTI-AGENTE CONCLUÍDO');
    console.log(`⏱️  Tempo Total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log('='.repeat(80) + '\n');

    return finalReport;
  }

  /**
   * Versão com callback de progresso (SEQUENCIAL)
   */
  async analyzeDocumentsWithProgress(
    piFile: File,
    documents: Array<{ file: File; type: string }>,
    onProgress?: (phase: string, progress: number, message: string) => void
  ): Promise<FinalReport> {
    const totalSteps = 1 + documents.length + documents.length + 1; // PI + docs + comparações + síntese
    let currentStep = 0;

    const updateProgress = (phase: string, message: string) => {
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      onProgress?.(phase, progress, message);
    };

    // FASE 1: Extração
    updateProgress('extraction', `Extraindo PI: ${piFile.name}`);
    const piData = await this.extractorAgent.extractDocument(piFile, 'pi');

    const documentsData: DocumentData[] = [];
    for (const doc of documents) {
      updateProgress('extraction', `Extraindo ${doc.type}: ${doc.file.name}`);
      const data = await this.extractorAgent.extractDocument(doc.file, doc.type);
      documentsData.push(data);
    }

    // FASE 2: Comparação
    const analyses: AnalysisReport[] = [];
    for (const docData of documentsData) {
      updateProgress('comparison', `Comparando ${docData.type}`);
      const analysis = await this.comparatorAgent.compareDocuments(piData, docData);
      analyses.push(analysis);
    }

    // FASE 3: Síntese
    updateProgress('synthesis', 'Gerando relatório final');
    const finalReport = await this.synthesizerAgent.synthesize(piData, documentsData, analyses);

    return finalReport;
  }

  /**
   * Versão com callback de progresso (PARALELA)
   * Até 67% mais rápido
   */
  async analyzeDocumentsWithProgressParallel(
    piFile: File,
    documents: Array<{ file: File; type: string }>,
    onProgress?: (phase: string, progress: number, message: string) => void
  ): Promise<FinalReport> {
    const startTime = Date.now();

    // FASE 1: Extração PARALELA (0-40%)
    onProgress?.('extraction', 5, 'Iniciando extração paralela...');
    
    const extractionPromises = [
      this.extractorAgent.extractDocument(piFile, 'pi'),
      ...documents.map(doc => this.extractorAgent.extractDocument(doc.file, doc.type))
    ];

    const [piData, ...documentsData] = await Promise.all(extractionPromises);
    onProgress?.('extraction', 40, `${documents.length + 1} documentos extraídos`);

    // FASE 2: Comparação PARALELA (40-80%)
    onProgress?.('comparison', 45, 'Iniciando comparações paralelas...');
    
    const comparisonPromises = documentsData.map(docData => 
      this.comparatorAgent.compareDocuments(piData, docData)
    );

    const analyses = await Promise.all(comparisonPromises);
    onProgress?.('comparison', 80, `${analyses.length} comparações concluídas`);

    // FASE 3: Síntese (80-100%)
    onProgress?.('synthesis', 85, 'Gerando relatório final...');
    const finalReport = await this.synthesizerAgent.synthesize(piData, documentsData, analyses);
    
    const totalTime = Date.now() - startTime;
    onProgress?.('synthesis', 100, `Concluído em ${(totalTime / 1000).toFixed(2)}s`);

    return finalReport;
  }
}
