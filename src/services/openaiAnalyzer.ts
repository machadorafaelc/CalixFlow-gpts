/**
 * Serviço de Análise de Documentos com OpenAI
 * 
 * Usa GPT-3.5-turbo para comparar documentos e identificar divergências
 * Versão 2.0: Com prompts especializados e suporte a imagens
 */

import OpenAI from 'openai';
import { DOCUMENT_DEFINITIONS, VALIDATION_RULES, SEVERITY_LEVELS } from './documentDefinitions';

export interface DocumentComparison {
  field: string;
  piValue: string;
  documentValue: string;
  match: boolean;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
  explanation?: string;
}

export interface AnalysisResult {
  comparisons: DocumentComparison[];
  overallStatus: 'approved' | 'rejected' | 'warning';
  summary: string;
}

export class OpenAIAnalyzer {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY não configurada. Adicione no arquivo .env');
    }
    
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Apenas para desenvolvimento/teste
    });
  }
  
  /**
   * Compara dois documentos e identifica divergências
   */
  async compareDocuments(
    piText: string,
    documentText: string,
    documentType: string
  ): Promise<AnalysisResult> {
    try {
      const prompt = this.buildComparisonPrompt(piText, documentText, documentType);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Baixa temperatura para respostas consistentes
        max_tokens: 2000,
      });
      
      const content = response.choices[0].message.content || '{}';
      const result = this.parseAIResponse(content);
      
      return result;
      
    } catch (error) {
      console.error('Erro ao analisar com OpenAI:', error);
      throw new Error(`Falha na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Analisa documento a partir de imagem usando GPT-4 Vision
   */
  async analyzeDocumentImage(
    piText: string,
    imageBase64: string,
    documentType: string
  ): Promise<AnalysisResult> {
    try {
      const prompt = this.buildImageAnalysisPrompt(piText, documentType);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });
      
      const content = response.choices[0].message.content || '{}';
      const result = this.parseAIResponse(content);
      
      return result;
      
    } catch (error) {
      console.error('Erro ao analisar imagem com OpenAI:', error);
      throw new Error(`Falha na análise de imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Retorna o prompt de sistema especializado
   */
  private getSystemPrompt(): string {
    return `Você é um especialista em análise de documentos fiscais e comerciais brasileiros, 
com foco em documentos de mídia e publicidade.

CONHECIMENTO ESPECIALIZADO:

${DOCUMENT_DEFINITIONS.PI.name}:
${DOCUMENT_DEFINITIONS.PI.description}

${DOCUMENT_DEFINITIONS.NOTA_FISCAL.name}:
${DOCUMENT_DEFINITIONS.NOTA_FISCAL.description}

${DOCUMENT_DEFINITIONS.COMPROVANTE_VEICULACAO.name}:
${DOCUMENT_DEFINITIONS.COMPROVANTE_VEICULACAO.description}

${DOCUMENT_DEFINITIONS.MAPA_MIDIA.name}:
${DOCUMENT_DEFINITIONS.MAPA_MIDIA.description}

REGRAS DE VALIDAÇÃO:
- Valor: ${VALIDATION_RULES.VALOR.description}
- Período: ${VALIDATION_RULES.PERIODO.description}
- Veículo: ${VALIDATION_RULES.VEICULO.description}
- Cliente: ${VALIDATION_RULES.CLIENTE.description}
- Formato: ${VALIDATION_RULES.FORMATO.description}

NÍVEIS DE SEVERIDADE:
- Crítico: ${SEVERITY_LEVELS.CRITICO.description}
- Atenção: ${SEVERITY_LEVELS.ATENCAO.description}
- Info: ${SEVERITY_LEVELS.INFO.description}
- OK: ${SEVERITY_LEVELS.OK.description}

Sua função é comparar documentos com precisão, identificar divergências e classificá-las corretamente.`;
  }
  
  /**
   * Constrói o prompt para comparação de documentos de texto
   */
  private buildComparisonPrompt(
    piText: string,
    documentText: string,
    documentType: string
  ): string {
    const fieldsToCompare = this.getFieldsForDocumentType(documentType);
    const docTypeName = this.getDocumentTypeName(documentType);
    
    return `
Analise e compare os seguintes documentos:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO BASE (PI - Pedido de Inserção)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${piText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DOCUMENTO PARA VALIDAÇÃO (${docTypeName})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documentText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 CAMPOS A COMPARAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fieldsToCompare.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INSTRUÇÕES DE ANÁLISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXTRAÇÃO:
   - Extraia os valores dos campos especificados de AMBOS os documentos
   - Se um campo não existir, indique como "Não informado"
   - Normalize valores (ex: R$ 1.500,00 = 1500.00)

2. COMPARAÇÃO:
   - Compare cada campo extraído
   - Para VALORES monetários: aceite diferença de até 1% (arredondamento)
   - Para DATAS: verifique se está dentro do período aprovado
   - Para TEXTOS: aceite variações de formatação, mas conteúdo deve ser igual

3. CLASSIFICAÇÃO DE SEVERIDADE:
   
   ⛔ CRITICAL (Crítico):
   - Valor divergente acima de 1%
   - Período completamente fora do aprovado
   - Veículo diferente do especificado
   - Cliente/CNPJ incorreto
   - Dados fiscais divergentes
   
   ⚠️ WARNING (Atenção):
   - Valor com diferença menor que 1%
   - Descrição incompleta mas correta
   - Formato similar mas não idêntico
   - Data de emissão próxima mas não exata
   - Campos opcionais faltando
   
   ℹ️ INFO (Informativo):
   - Informações adicionais presentes
   - Formatação diferente mas conteúdo igual
   - Campos complementares
   - Observações gerais

4. CONFIANÇA:
   - 0.9-1.0: Valores claros e inequívocos
   - 0.7-0.9: Valores identificáveis com pequena ambiguidade
   - 0.5-0.7: Valores inferidos ou parcialmente legíveis
   - 0.0-0.5: Valores muito ambíguos ou ilegíveis

5. STATUS GERAL:
   - "approved": Todos os campos críticos batem, divergências apenas info/warning
   - "warning": Há divergências de atenção que precisam revisão
   - "rejected": Há divergências críticas que impedem aprovação

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMATO DE RESPOSTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responda APENAS com JSON no formato abaixo (sem texto adicional):

{
  "comparisons": [
    {
      "field": "Nome do Campo",
      "piValue": "Valor extraído do PI",
      "documentValue": "Valor extraído do documento",
      "match": true ou false,
      "confidence": 0.95,
      "severity": "critical" ou "warning" ou "info",
      "explanation": "Explicação clara da divergência (se houver)"
    }
  ],
  "overallStatus": "approved" ou "rejected" ou "warning",
  "summary": "Resumo executivo da análise em 1-2 frases"
}

IMPORTANTE: Responda APENAS com o JSON, sem markdown, sem texto antes ou depois.
`;
  }
  
  /**
   * Constrói o prompt para análise de imagens
   */
  private buildImageAnalysisPrompt(piText: string, documentType: string): string {
    const fieldsToCompare = this.getFieldsForDocumentType(documentType);
    const docTypeName = this.getDocumentTypeName(documentType);
    
    return `
Analise a IMAGEM do documento anexada e compare com o PI abaixo:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO BASE (PI - Pedido de Inserção)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${piText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 CAMPOS A EXTRAIR DA IMAGEM E COMPARAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fieldsToCompare.join('\n')}

O documento na imagem é do tipo: ${docTypeName}

INSTRUÇÕES:
1. Leia cuidadosamente TODOS os textos visíveis na imagem
2. Extraia os valores dos campos especificados
3. Compare com os valores do PI
4. Classifique divergências conforme as regras de severidade
5. Se algum texto estiver ilegível, indique confidence baixo

Responda APENAS com JSON no formato especificado anteriormente.
`;
  }
  
  /**
   * Define campos a serem comparados por tipo de documento
   */
  private getFieldsForDocumentType(documentType: string): string[] {
    const fieldsMap: Record<string, string[]> = {
      'notaFiscal': [
        '✓ Número da Nota Fiscal',
        '✓ CNPJ do Emitente (Veículo)',
        '✓ Razão Social do Emitente',
        '✓ CNPJ do Tomador (Cliente)',
        '✓ Razão Social do Tomador',
        '✓ Valor Total da NF (com impostos)',
        '✓ Valor Líquido (sem impostos)',
        '✓ Data de Emissão',
        '✓ Descrição do Serviço/Produto',
        '✓ Período de Veiculação (se aplicável)',
        '✓ ISS, PIS, COFINS (impostos)',
      ],
      'comprovante': [
        '✓ Data/Hora da Veiculação',
        '✓ Veículo de Comunicação',
        '✓ Formato do Anúncio',
        '✓ Programa/Seção',
        '✓ Cliente/Marca',
      ],
      'mapa': [
        '✓ Cliente/Marca',
        '✓ Período da Campanha',
        '✓ Lista de Veículos',
        '✓ Valor Total Investido',
        '✓ Distribuição por Veículo',
        '✓ Formatos Contratados',
      ],
      'artigo299': [
        '✓ CNPJ da Empresa',
        '✓ Razão Social',
        '✓ Período de Vigência',
        '✓ Data de Emissão',
        '✓ Regime de Tributação',
      ],
      'simplesNacional': [
        '✓ CNPJ',
        '✓ Razão Social',
        '✓ Período de Validade',
        '✓ Situação (Ativa/Inativa)',
      ]
    };
    
    return fieldsMap[documentType] || [
      '✓ CNPJ',
      '✓ Razão Social',
      '✓ Valores',
      '✓ Datas',
      '✓ Descrição',
    ];
  }
  
  /**
   * Retorna nome legível do tipo de documento
   */
  private getDocumentTypeName(documentType: string): string {
    const names: Record<string, string> = {
      'notaFiscal': 'Nota Fiscal',
      'comprovante': 'Comprovante de Veiculação',
      'mapa': 'Mapa de Mídia',
      'artigo299': 'Artigo 299',
      'simplesNacional': 'Comprovante Simples Nacional'
    };
    
    return names[documentType] || documentType;
  }
  
  /**
   * Faz parsing da resposta da IA
   */
  private parseAIResponse(content: string): AnalysisResult {
    try {
      // Remove possíveis markdown code blocks
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Valida estrutura
      if (!parsed.comparisons || !Array.isArray(parsed.comparisons)) {
        throw new Error('Resposta inválida: falta array de comparisons');
      }
      
      return {
        comparisons: parsed.comparisons.map((comp: any) => ({
          field: comp.field || 'Campo não identificado',
          piValue: comp.piValue || 'N/A',
          documentValue: comp.documentValue || 'N/A',
          match: comp.match === true,
          confidence: typeof comp.confidence === 'number' ? comp.confidence : 0.5,
          severity: this.validateSeverity(comp.severity),
          explanation: comp.explanation || ''
        })),
        overallStatus: this.validateStatus(parsed.overallStatus),
        summary: parsed.summary || 'Análise concluída'
      };
      
    } catch (error) {
      console.error('Erro ao fazer parsing da resposta:', error);
      console.error('Conteúdo recebido:', content);
      
      // Retorna resultado de erro
      return {
        comparisons: [],
        overallStatus: 'warning',
        summary: 'Erro ao processar resposta da IA. Verifique os logs.'
      };
    }
  }
  
  /**
   * Valida e normaliza severity
   */
  private validateSeverity(severity: any): 'critical' | 'warning' | 'info' {
    if (severity === 'critical' || severity === 'warning' || severity === 'info') {
      return severity;
    }
    return 'info';
  }
  
  /**
   * Valida e normaliza status
   */
  private validateStatus(status: any): 'approved' | 'rejected' | 'warning' {
    if (status === 'approved' || status === 'rejected' || status === 'warning') {
      return status;
    }
    return 'warning';
  }
}
