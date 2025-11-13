/**
 * Serviço de Análise de Documentos com OpenAI
 * 
 * Usa GPT-3.5-turbo para comparar documentos e identificar divergências
 * Versão 3.0: Com conhecimento profundo baseado em documentos reais
 */

import OpenAI from 'openai';
import { DOCUMENT_DEFINITIONS, VALIDATION_RULES, SEVERITY_LEVELS, COMMON_ISSUES } from './documentDefinitions';
import { documentExamples } from './documentExamples';

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
        model: 'gpt-4o-mini', // Melhor custo-benefício: $0.15/1M input, $0.60/1M output
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
        max_tokens: 3000,
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
   * NOTA: Método analyzeDocumentImage foi removido.
   * Agora usamos OCR local (Tesseract.js) + GPT-4o-mini para reduzir custos.
   * De $196/mês para $2.80/mês em 2000 análises!
   * 
   * Fluxo atual:
   * 1. ImageProcessor extrai texto da imagem (OCR local - grátis)
   * 2. DocumentExtractor normaliza o texto
   * 3. OpenAIAnalyzer.compareDocuments analisa (GPT-4o-mini - barato)
   */
  
  /**
   * Retorna o prompt de sistema especializado com exemplos reais
   */
  private getSystemPrompt(): string {
    return `Você é um ESPECIALISTA SÊNIOR em análise de documentos fiscais e comerciais brasileiros,
com FOCO ESPECÍFICO em documentos de mídia e publicidade.

Você tem ANOS DE EXPERIÊNCIA analisando PIs (Pedidos de Inserção), Notas Fiscais de Serviços,
Comprovantes de Veiculação, Mapas de Mídia e Declarações do Artigo 299.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 CONHECIMENTO PROFUNDO DOS DOCUMENTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${DOCUMENT_DEFINITIONS.PI.name}:
${DOCUMENT_DEFINITIONS.PI.description}

${DOCUMENT_DEFINITIONS.NOTA_FISCAL.name}:
${DOCUMENT_DEFINITIONS.NOTA_FISCAL.description}

${DOCUMENT_DEFINITIONS.ARTIGO_299.name}:
${DOCUMENT_DEFINITIONS.ARTIGO_299.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EXEMPLO REAL DE PI (Para Referência)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PI Número: ${documentExamples.PI.number}
Cliente: ${documentExamples.PI.data.cliente.nome}
CNPJ Cliente: ${documentExamples.PI.data.cliente.cnpj}
Veículo: ${documentExamples.PI.data.veiculo.nome}
CNPJ Veículo: ${documentExamples.PI.data.veiculo.cnpj}
Valor Total: R$ ${documentExamples.PI.data.valores.valorTotal.toFixed(2)}
Total Líquido: R$ ${documentExamples.PI.data.valores.totalLiquido.toFixed(2)}
Desconto Padrão: R$ ${documentExamples.PI.data.valores.descontoPadrao.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EXEMPLO REAL DE NOTA FISCAL (Para Referência)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NF Número: ${documentExamples.NotaFiscal.number}
Prestador: ${documentExamples.NotaFiscal.data.prestador.nome}
CNPJ Prestador: ${documentExamples.NotaFiscal.data.prestador.cnpj}
Tomador: ${documentExamples.NotaFiscal.data.tomador.nome}
CNPJ Tomador: ${documentExamples.NotaFiscal.data.tomador.cnpj}
Valor Líquido: R$ ${documentExamples.NotaFiscal.data.servico.valorLiquido.toFixed(2)}
Valor Bruto: R$ ${documentExamples.NotaFiscal.data.servico.valorBruto.toFixed(2)}
Discriminação: ${documentExamples.NotaFiscal.data.servico.discriminacao.substring(0, 200)}...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ REGRAS DE VALIDAÇÃO CRÍTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VALORES:
   ${VALIDATION_RULES.VALOR.description}
   Exemplos:
   ${VALIDATION_RULES.VALOR.examples?.join('\n   ') || ''}

2. PERÍODO:
   ${VALIDATION_RULES.PERIODO.description}
   Exemplos:
   ${VALIDATION_RULES.PERIODO.examples?.join('\n   ') || ''}

3. VEÍCULO:
   ${VALIDATION_RULES.VEICULO.description}
   Exemplos:
   ${VALIDATION_RULES.VEICULO.examples?.join('\n   ') || ''}

4. CLIENTE:
   ${VALIDATION_RULES.CLIENTE.description}
   Exemplos:
   ${VALIDATION_RULES.CLIENTE.examples?.join('\n   ') || ''}

5. DESCRIÇÃO DA NF:
   ${VALIDATION_RULES.DESCRICAO_NF.description}
   Exemplos:
   ${VALIDATION_RULES.DESCRICAO_NF.examples?.join('\n   ') || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NÍVEIS DE SEVERIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${SEVERITY_LEVELS.CRITICO.icon} CRÍTICO:
${SEVERITY_LEVELS.CRITICO.description}
Exemplos: ${SEVERITY_LEVELS.CRITICO.examples.join(', ')}
Ação: ${SEVERITY_LEVELS.CRITICO.action}

${SEVERITY_LEVELS.ATENCAO.icon} ATENÇÃO:
${SEVERITY_LEVELS.ATENCAO.description}
Exemplos: ${SEVERITY_LEVELS.ATENCAO.examples.join(', ')}
Ação: ${SEVERITY_LEVELS.ATENCAO.action}

${SEVERITY_LEVELS.INFO.icon} INFORMATIVO:
${SEVERITY_LEVELS.INFO.description}
Exemplos: ${SEVERITY_LEVELS.INFO.examples.join(', ')}
Ação: ${SEVERITY_LEVELS.INFO.action}

${SEVERITY_LEVELS.OK.icon} CONFORME:
${SEVERITY_LEVELS.OK.description}
Exemplos: ${SEVERITY_LEVELS.OK.examples.join(', ')}
Ação: ${SEVERITY_LEVELS.OK.action}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PROBLEMAS COMUNS E SOLUÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${COMMON_ISSUES.VALOR_DIVERGENTE.title}:
${COMMON_ISSUES.VALOR_DIVERGENTE.description}
Causas: ${COMMON_ISSUES.VALOR_DIVERGENTE.possibleCauses.join(', ')}

${COMMON_ISSUES.CNPJ_ERRADO.title}:
${COMMON_ISSUES.CNPJ_ERRADO.description}
Causas: ${COMMON_ISSUES.CNPJ_ERRADO.possibleCauses.join(', ')}

${COMMON_ISSUES.FALTA_PI.title}:
${COMMON_ISSUES.FALTA_PI.description}
Causas: ${COMMON_ISSUES.FALTA_PI.possibleCauses.join(', ')}

${COMMON_ISSUES.DATA_ERRADA.title}:
${COMMON_ISSUES.DATA_ERRADA.description}
Causas: ${COMMON_ISSUES.DATA_ERRADA.possibleCauses.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SUA MISSÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Você deve analisar os documentos fornecidos com PRECISÃO CIRÚRGICA, identificando:
1. Divergências CRÍTICAS que impedem aprovação
2. Divergências de ATENÇÃO que requerem verificação
3. Informações complementares
4. Conformidades

Seja DETALHADO nas explicações, citando os valores específicos encontrados.
Seja ASSERTIVO na classificação de severidade.
Seja PROFISSIONAL e CLARO nas recomendações.`;
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTO BASE (PI - Pedido de Inserção)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${piText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DOCUMENTO PARA VALIDAÇÃO (${docTypeName})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documentText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 CAMPOS OBRIGATÓRIOS A COMPARAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fieldsToCompare.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INSTRUÇÕES DETALHADAS DE ANÁLISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSO 1 - EXTRAÇÃO:
   - Extraia TODOS os valores dos campos especificados de AMBOS os documentos
   - Se um campo não existir, indique como "Não informado"
   - Normalize valores monetários (ex: R$ 1.500,00 → 1500.00)
   - Normalize CNPJs (ex: 14.173.345/0001-51 → 14173345000151)
   - Normalize datas (ex: 31/10/2023 → 2023-10-31)

PASSO 2 - COMPARAÇÃO DETALHADA:
   
   Para VALORES MONETÁRIOS (SEJA RIGOROSO):
   - Compare o VALOR LÍQUIDO da NF com o TOTAL LÍQUIDO do PI
   - Calcule a diferença percentual: |valor_nf - valor_pi| / valor_pi * 100
   - Se diferença ≤ 0.5%: severity = "info" (tolerância mínima de arredondamento)
   - Se 0.5% < diferença ≤ 2%: severity = "warning" (requer justificativa)
   - Se diferença > 2%: severity = "critical" (REJEITAR IMEDIATAMENTE)
   - ATENÇÃO: Valores devem ser QUASE IDÊNTICOS. Não aceite diferenças grandes!
   
   Para CNPJ:
   - DEVE ser EXATAMENTE igual (após normalização)
   - Qualquer diferença = "critical"
   - Verifique CNPJ do Prestador (veículo) e Tomador (cliente)
   
   Para RAZÃO SOCIAL:
   - DEVE ser EXATAMENTE igual ou muito similar
   - Aceite variações de acentuação e pontuação
   - Aceite abreviações padronizadas (ex: LTDA vs LIMITADA)
   - Diferenças significativas = "critical"
   
   Para DATAS:
   - Verifique se data de veiculação está no período do PI
   - Verifique se data de emissão da NF é POSTERIOR à veiculação
   - NF emitida ANTES da veiculação = "critical"
   
   Para DISCRIMINAÇÃO DA NF:
   - DEVE mencionar o número do PI (ex: "Conforme PI: 60656")
   - DEVE mencionar "Desconto-Padrão" ou "remuneração da agência"
   - Falta do PI = "critical"
   - Falta do Desconto-Padrão = "warning"

PASSO 3 - CLASSIFICAÇÃO DE SEVERIDADE:
   
   Use "critical" quando (REJEITAR DOCUMENTO):
   - Valor diverge mais de 2%
   - CNPJ diferente (mesmo que um dígito)
   - Razão Social completamente diferente
   - Período fora do aprovado no PI
   - NF emitida antes da veiculação
   - Falta número do PI na descrição da NF
   - Veículo diferente do especificado no PI
   - Qualquer informação essencial divergente
   
   Use "warning" quando (REQUER REVISÃO):
   - Valor diverge entre 0.5% e 2%
   - Descrição incompleta mas com número do PI
   - Falta menção ao Desconto-Padrão na descrição
   - Endereço com pequenas diferenças de formatação
   - Data de emissão muito próxima da veiculação
   
   Use "info" quando (APENAS INFORMATIVO):
   - Valor diverge menos de 0.5% (arredondamento aceitável)
   - Campos opcionais faltando
   - Formatação diferente mas conteúdo idêntico
   - Informações adicionais presentes que não afetam validade

PASSO 4 - CONFIANÇA:
   - 1.0: Valores claros, sem ambiguidade
   - 0.9: Valores claros com pequena variação de formato
   - 0.7: Valores identificáveis mas com alguma ambiguidade
   - 0.5: Valores inferidos ou parcialmente legíveis
   - 0.3: Valores muito ambíguos

PASSO 5 - STATUS GERAL (SEJA RIGOROSO):
   
   REGRA ABSOLUTA: Se houver QUALQUER divergência "critical", o status DEVE ser "rejected".
   
   - "rejected": Há UMA OU MAIS divergências críticas
     * Valor diverge mais de 5%
     * CNPJ diferente
     * Razão Social completamente diferente
     * Período fora do aprovado
     * Falta número do PI na descrição
     * Veículo diferente
     * QUALQUER outro problema crítico
   
   - "warning": Nenhuma divergência crítica, mas há divergências de atenção
     * Valor diverge entre 1% e 5%
     * Descrição incompleta mas com PI
     * Falta Desconto-Padrão na descrição
   
   - "approved": APENAS se nenhuma divergência crítica OU de atenção
     * Todos os campos conferem
     * Diferenças mínimas (< 1%) são aceitáveis
     * Apenas divergências informativas
   
   ATENÇÃO: NÃO seja permissivo! Se houver DÚVIDA, marque como "rejected" ou "warning".

PASSO 6 - RESUMO:
   - Escreva um resumo EXECUTIVO em 2-3 frases
   - Mencione o status geral (Aprovado/Atenção/Rejeitado)
   - Destaque as divergências mais importantes
   - Seja CLARO e DIRETO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMATO DE RESPOSTA (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responda APENAS com JSON no formato abaixo (sem texto adicional, sem markdown):

{
  "comparisons": [
    {
      "field": "Nome do campo",
      "piValue": "Valor encontrado no PI",
      "documentValue": "Valor encontrado no documento",
      "match": true/false,
      "confidence": 0.0-1.0,
      "severity": "critical" | "warning" | "info",
      "explanation": "Explicação detalhada da divergência ou conformidade"
    }
  ],
  "overallStatus": "approved" | "warning" | "rejected",
  "summary": "Resumo executivo da análise em 2-3 frases"
}

IMPORTANTE: Retorne APENAS o JSON, sem \`\`\`json ou qualquer outro texto.
`;
  }
  
  // buildImageAnalysisPrompt removido - não é mais necessário com OCR local
  
  /**
   * Retorna os campos a serem comparados para cada tipo de documento
   */
  private getFieldsForDocumentType(documentType: string): string[] {
    const commonFields = [
      '- Número do PI (deve estar mencionado no documento)',
      '- Razão Social do Cliente/Tomador',
      '- CNPJ do Cliente/Tomador',
      '- Razão Social do Veículo/Prestador',
      '- CNPJ do Veículo/Prestador',
    ];
    
    switch (documentType.toLowerCase()) {
      case 'nota fiscal':
      case 'nf':
      case 'nota_fiscal':
        return [
          ...commonFields,
          '- Valor Líquido (compare com Total Líquido do PI)',
          '- Valor Bruto',
          '- Data de Emissão (deve ser posterior à veiculação)',
          '- Data de Vencimento',
          '- Discriminação do Serviço (deve mencionar PI e Desconto-Padrão)',
          '- Valor do ISS',
          '- Base de Cálculo',
          '- Código do Serviço',
        ];
        
      case 'comprovante':
      case 'comprovante de veiculação':
      case 'comprovante_veiculacao':
        return [
          ...commonFields,
          '- Data da Veiculação (deve estar no período do PI)',
          '- Horário da Veiculação',
          '- Veículo/Canal',
          '- Programa/Seção',
          '- Formato (duração, tamanho)',
          '- Quantidade de Inserções',
        ];
        
      case 'artigo 299':
      case 'declaração':
      case 'declaracao':
        return [
          '- Número do PI mencionado',
          '- Nome da Empresa Declarante',
          '- CNPJ da Empresa Declarante',
          '- Nome do Responsável',
          '- Cargo do Responsável',
          '- RG e CPF do Responsável',
          '- Data da Declaração',
          '- Assinatura (presente ou ausente)',
        ];
        
      case 'mapa':
      case 'mapa de mídia':
      case 'mapa_midia':
        return [
          ...commonFields,
          '- Período Total',
          '- Investimento Total (deve bater com soma dos PIs)',
          '- Veículos Listados',
          '- Datas de Veiculação',
          '- Formatos',
          '- Valores por Veículo',
        ];
        
      default:
        return commonFields;
    }
  }
  
  /**
   * Retorna o nome amigável do tipo de documento
   */
  private getDocumentTypeName(documentType: string): string {
    const types: Record<string, string> = {
      'nota fiscal': 'Nota Fiscal de Serviços (NFS-e)',
      'nf': 'Nota Fiscal de Serviços (NFS-e)',
      'nota_fiscal': 'Nota Fiscal de Serviços (NFS-e)',
      'comprovante': 'Comprovante de Veiculação',
      'comprovante de veiculação': 'Comprovante de Veiculação',
      'comprovante_veiculacao': 'Comprovante de Veiculação',
      'artigo 299': 'Declaração - Artigo 299',
      'declaração': 'Declaração - Artigo 299',
      'declaracao': 'Declaração - Artigo 299',
      'mapa': 'Mapa de Mídia',
      'mapa de mídia': 'Mapa de Mídia',
      'mapa_midia': 'Mapa de Mídia',
    };
    
    return types[documentType.toLowerCase()] || documentType;
  }
  
  /**
   * Faz o parse da resposta da IA
   */
  private parseAIResponse(content: string): AnalysisResult {
    try {
      // Remove possíveis markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(cleanContent);
      
      // Validação básica
      if (!parsed.comparisons || !Array.isArray(parsed.comparisons)) {
        throw new Error('Formato de resposta inválido: falta array de comparisons');
      }
      
      if (!parsed.overallStatus || !parsed.summary) {
        throw new Error('Formato de resposta inválido: falta overallStatus ou summary');
      }
      
      return parsed as AnalysisResult;
      
    } catch (error) {
      console.error('Erro ao fazer parse da resposta:', error);
      console.error('Conteúdo recebido:', content);
      
      // Retorna resultado de erro
      return {
        comparisons: [{
          field: 'Erro de Análise',
          piValue: '',
          documentValue: '',
          match: false,
          confidence: 0,
          severity: 'critical',
          explanation: `Erro ao processar resposta da IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }],
        overallStatus: 'rejected',
        summary: 'Não foi possível completar a análise devido a um erro técnico. Por favor, tente novamente.'
      };
    }
  }
}

export default OpenAIAnalyzer;
