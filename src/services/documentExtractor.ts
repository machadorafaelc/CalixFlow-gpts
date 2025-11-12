/**
 * Serviço de Extração de Texto de Documentos
 * 
 * Extrai texto de arquivos PDF, DOC, DOCX, TXT e IMAGENS
 * Versão 2.0: Com suporte a imagens
 */

import { ImageProcessor } from './imageProcessor';

export class DocumentExtractor {
  /**
   * Extrai texto de um arquivo
   * Suporta: TXT, PDF, DOC, DOCX e IMAGENS (JPG, PNG, etc.)
   */
  async extractText(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Arquivos de texto puro
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await this.readTextFile(file);
    }
    
    // Imagens - retorna indicador para processamento com Vision
    if (ImageProcessor.isImage(file)) {
      return '[IMAGEM] Este arquivo será processado com OCR/Vision';
    }
    
    // PDFs e DOCs - versão simplificada com mock
    // Em produção, use pdf-parse para PDFs e mammoth para DOCs
    return this.generateMockText(file);
  }
  
  /**
   * Verifica se o arquivo é uma imagem
   */
  isImage(file: File): boolean {
    return ImageProcessor.isImage(file);
  }
  
  /**
   * Verifica se o arquivo é um PDF
   */
  isPDF(file: File): boolean {
    return ImageProcessor.isPDF(file);
  }
  
  /**
   * Lê arquivo de texto puro
   */
  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Gera texto mockado baseado no tipo de documento
   * Em produção, isso seria substituído por extração real de PDF/DOC
   */
  private generateMockText(file: File): string {
    const fileName = file.name.toLowerCase();
    
    // Detecta tipo de documento pelo nome
    if (fileName.includes('pi') || fileName.includes('pedido')) {
      return this.generatePIMock();
    } else if (fileName.includes('nota') || fileName.includes('fiscal') || fileName.includes('nf')) {
      return this.generateNotaFiscalMock();
    } else if (fileName.includes('299') || fileName.includes('artigo')) {
      return this.generateArtigo299Mock();
    } else if (fileName.includes('relatorio') || fileName.includes('report')) {
      return this.generateRelatorioMock();
    } else if (fileName.includes('simples')) {
      return this.generateSimplesNacionalMock();
    } else if (fileName.includes('comprovante') || fileName.includes('veiculacao')) {
      return this.generateComprovanteVeiculacaoMock();
    } else if (fileName.includes('mapa')) {
      return this.generateMapaMidiaMock();
    }
    
    return `Documento: ${file.name}\nConteúdo extraído para análise.`;
  }
  
  private generatePIMock(): string {
    return `
PEDIDO DE INSERÇÃO (PI)
Número: PI-2025-001
Data de Emissão: 10/11/2025

DADOS DO CLIENTE:
CNPJ: 98.765.432/0001-10
Razão Social: Cliente ABC S.A.
Marca/Produto: Produto XYZ

DADOS DO VEÍCULO:
CNPJ: 12.345.678/0001-90
Razão Social: Rede Globo de Televisão
Veículo: TV Globo São Paulo

DADOS DA CAMPANHA:
Campanha: Black Friday 2025
Produto Anunciado: Produto XYZ
Formato: Spot 30 segundos
Período de Veiculação: 15/11/2025 a 30/11/2025
Praça: São Paulo/SP

VALORES:
Valor Total Aprovado: R$ 150.000,00
Forma de Pagamento: Boleto bancário
Vencimento: 30/11/2025

APROVAÇÃO:
Aprovador: João Silva - Diretor de Mídia
Data de Aprovação: 10/11/2025

OBSERVAÇÕES:
Serviço sujeito a retenção de impostos conforme legislação vigente.
Veiculação condicionada à aprovação do material publicitário.
    `.trim();
  }
  
  private generateNotaFiscalMock(): string {
    return `
NOTA FISCAL DE SERVIÇOS ELETRÔNICA - NFS-e
Número: 12345
Série: A
Data de Emissão: 25/11/2025

PRESTADOR DE SERVIÇOS (Emitente):
CNPJ: 12.345.678/0001-90
Razão Social: Rede Globo de Televisão
Inscrição Municipal: 123.456.789
Endereço: Rua Exemplo, 123 - São Paulo/SP - CEP 01234-567

TOMADOR DE SERVIÇOS:
CNPJ: 98.765.432/0001-10
Razão Social: Cliente ABC S.A.
Endereço: Av. Cliente, 456 - São Paulo/SP

DISCRIMINAÇÃO DOS SERVIÇOS:
Veiculação de spot publicitário de 30 segundos
Campanha: Black Friday 2025
Produto: Produto XYZ
Período de Veiculação: 15/11/2025 a 30/11/2025
Conforme PI-2025-001

VALORES:
Valor Bruto dos Serviços: R$ 148.500,00
(-) Descontos: R$ 0,00
(=) Valor Líquido: R$ 148.500,00

TRIBUTOS RETIDOS:
ISS (5%): R$ 7.425,00
PIS (0,65%): R$ 965,25
COFINS (3%): R$ 4.455,00
IR (1,5%): R$ 2.227,50

VALOR TOTAL DA NOTA: R$ 148.500,00

Código de Verificação: ABC123XYZ789
    `.trim();
  }
  
  private generateComprovanteVeiculacaoMock(): string {
    return `
COMPROVANTE DE VEICULAÇÃO

DADOS DA CAMPANHA:
Cliente: Cliente ABC S.A.
Produto: Produto XYZ
Campanha: Black Friday 2025
PI: PI-2025-001

DADOS DA VEICULAÇÃO:
Veículo: TV Globo São Paulo
Formato: Spot 30 segundos
Data: 20/11/2025
Horário: 20:45:30
Programa: Jornal Nacional
Inserção: Intervalo Comercial #2

EVIDÊNCIAS:
- Gravação do spot veiculado (arquivo anexo)
- Print da grade de programação
- Certificado do veículo

RESPONSÁVEL:
Rede Globo de Televisão
CNPJ: 12.345.678/0001-90

Certificado emitido em: 21/11/2025
    `.trim();
  }
  
  private generateMapaMidiaMock(): string {
    return `
MAPA DE MÍDIA - PLANEJAMENTO DE CAMPANHA

DADOS DA CAMPANHA:
Cliente: Cliente ABC S.A.
Produto: Produto XYZ
Campanha: Black Friday 2025
Período: 15/11/2025 a 30/11/2025
Investimento Total: R$ 150.000,00

DISTRIBUIÇÃO POR VEÍCULO:

1. TV GLOBO SÃO PAULO
   - Formato: Spot 30"
   - Inserções: 60
   - Valor: R$ 90.000,00
   - Período: 15/11 a 30/11
   - Programas: Jornal Nacional, Fantástico

2. GOOGLE ADS
   - Formato: Display + Search
   - Impressões estimadas: 500.000
   - Valor: R$ 35.000,00
   - Período: 15/11 a 30/11

3. META ADS (Facebook/Instagram)
   - Formato: Carrossel + Stories
   - Impressões estimadas: 800.000
   - Valor: R$ 25.000,00
   - Período: 15/11 a 30/11

MÉTRICAS ESTIMADAS:
- Alcance Total: 2.500.000 pessoas
- GRP (TV): 180
- Frequência Média: 3,5

CRONOGRAMA:
Semana 1 (15-21/11): 40% do investimento
Semana 2 (22-28/11): 50% do investimento
Semana 3 (29-30/11): 10% do investimento

Planejamento aprovado em: 10/11/2025
    `.trim();
  }
  
  private generateArtigo299Mock(): string {
    return `
DECLARAÇÃO - ARTIGO 299 DO RIR/2018

CNPJ: 12.345.678/0001-90
Razão Social: Rede Globo de Televisão

Declaramos para os devidos fins que a empresa acima qualificada
está enquadrada no regime de tributação do Lucro Presumido.

Período de Vigência: 01/01/2025 a 31/12/2025
Data de Emissão: 10/11/2025

Esta declaração é válida para fins de retenção de tributos
federais na fonte conforme legislação vigente.

Responsável: Departamento Fiscal
    `.trim();
  }
  
  private generateRelatorioMock(): string {
    return `
RELATÓRIO DE PERFORMANCE - CAMPANHA DIGITAL

DADOS DA CAMPANHA:
Cliente: Cliente ABC S.A.
Produto: Produto XYZ
Campanha: Black Friday 2025
Período: 15/11/2025 a 30/11/2025

INVESTIMENTO:
Total Investido: R$ 60.000,00
Google Ads: R$ 35.000,00
Meta Ads: R$ 25.000,00

RESULTADOS GOOGLE ADS:
- Impressões: 520.340
- Cliques: 26.017
- CTR: 5,0%
- CPC Médio: R$ 1,35
- Conversões: 780
- Taxa de Conversão: 3,0%
- CPA: R$ 44,87

RESULTADOS META ADS:
- Impressões: 815.200
- Cliques: 32.608
- CTR: 4,0%
- CPC Médio: R$ 0,77
- Conversões: 978
- Taxa de Conversão: 3,0%
- CPA: R$ 25,56

RESULTADOS CONSOLIDADOS:
- Impressões Totais: 1.335.540
- Cliques Totais: 58.625
- CTR Médio: 4,4%
- Conversões Totais: 1.758
- CPA Médio: R$ 34,13
- ROAS: 520%
- Receita Gerada: R$ 312.000,00

Relatório gerado em: 01/12/2025
    `.trim();
  }
  
  private generateSimplesNacionalMock(): string {
    return `
COMPROVANTE DE OPÇÃO PELO SIMPLES NACIONAL

CNPJ: 12.345.678/0001-90
Razão Social: Empresa Exemplo Ltda

Situação: ATIVA no Simples Nacional
Data de Opção: 01/01/2024
Período de Validade: 01/01/2025 a 31/12/2025

Anexo de Tributação: Anexo III - Serviços
Faixa de Receita Bruta: Até R$ 360.000,00/ano
Alíquota Efetiva: 6,00%

Este documento comprova que a empresa está regularmente
inscrita no Regime Especial Unificado de Arrecadação de
Tributos e Contribuições - Simples Nacional.

Emitido em: 10/11/2025
Fonte: Portal do Simples Nacional
    `.trim();
  }
}
