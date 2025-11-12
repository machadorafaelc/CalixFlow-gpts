/**
 * Definições e contexto sobre os tipos de documentos
 */

export const DOCUMENT_DEFINITIONS = {
  PI: {
    name: 'PI - Pedido de Inserção',
    description: `
O Pedido de Inserção (PI) é o documento base que autoriza a veiculação de mídia.
É o documento de referência contra o qual todos os outros documentos devem ser validados.

CAMPOS PRINCIPAIS:
- Número do PI: Identificador único do pedido
- Cliente: Nome da empresa/marca anunciante
- Produto/Serviço: O que está sendo anunciado
- Veículo: Onde a mídia será veiculada (TV, rádio, jornal, digital, etc.)
- Período: Data de início e fim da veiculação
- Valor Total: Montante aprovado para o investimento
- Formato: Tipo de anúncio (spot 30", banner, página inteira, etc.)
- Praça: Localização geográfica da veiculação
- Agência: Agência de publicidade responsável
- Data de Emissão: Quando o PI foi criado
- Aprovador: Quem autorizou o PI

IMPORTÂNCIA:
O PI é o documento MESTRE. Todos os outros documentos (Nota Fiscal, Comprovante de Veiculação, etc.)
devem estar EXATAMENTE de acordo com o que está no PI.
    `.trim(),
  },

  NOTA_FISCAL: {
    name: 'Nota Fiscal',
    description: `
A Nota Fiscal é o documento fiscal que comprova a prestação de serviço ou venda.
No contexto de mídia, comprova que o veículo prestou o serviço de veiculação.

CAMPOS PRINCIPAIS:
- Número da NF: Identificador único da nota fiscal
- Emitente: Veículo de comunicação que prestou o serviço
- Tomador: Cliente/agência que contratou
- Data de Emissão: Quando a NF foi emitida
- Valor Total: Montante cobrado
- Descrição do Serviço: O que foi veiculado
- Período de Veiculação: Quando a mídia foi ao ar
- CNPJ: Dados fiscais do emitente
- Impostos: ISS, PIS, COFINS, etc.

VALIDAÇÕES IMPORTANTES:
1. Valor da NF deve BATER com o valor do PI
2. Período deve estar DENTRO do período do PI
3. Descrição deve ser COMPATÍVEL com o PI
4. Emitente deve ser o VEÍCULO especificado no PI
5. Tomador deve ser o CLIENTE do PI

DIVERGÊNCIAS COMUNS:
- Valor diferente (desconto, taxa, erro)
- Período incompatível
- Descrição genérica ou incorreta
- Dados do tomador errados
    `.trim(),
  },

  COMPROVANTE_VEICULACAO: {
    name: 'Comprovante de Veiculação',
    description: `
Documento que comprova que a mídia realmente foi ao ar/publicada.
Pode ser um print, screenshot, gravação, ou certificado do veículo.

CAMPOS PRINCIPAIS:
- Data/Hora da Veiculação: Quando exatamente foi ao ar
- Veículo: Onde foi veiculado
- Formato: Como foi veiculado
- Programa/Seção: Em qual contexto apareceu
- Evidência: Print, vídeo, áudio, etc.

VALIDAÇÕES:
1. Data deve estar no PERÍODO do PI
2. Veículo deve ser o MESMO do PI
3. Formato deve ser COMPATÍVEL com o PI
    `.trim(),
  },

  MAPA_MIDIA: {
    name: 'Mapa de Mídia',
    description: `
Planejamento detalhado da campanha, mostrando quando e onde cada peça será veiculada.

CAMPOS PRINCIPAIS:
- Cronograma: Datas de cada veiculação
- Veículos: Lista de todos os veículos
- Formatos: Tipos de anúncios
- Valores: Investimento por veículo/período
- GRP/TRP: Métricas de alcance (TV/Rádio)
- Impressões: Métricas digitais

VALIDAÇÕES:
1. Total do mapa deve BATER com valor do PI
2. Período deve estar DENTRO do PI
3. Veículos devem estar no PI
    `.trim(),
  },
};

export const VALIDATION_RULES = {
  VALOR: {
    tolerance: 0.01, // 1% de tolerância para arredondamentos
    critical: true,
    description: 'Valores devem ser idênticos ou dentro da tolerância de 1%',
  },

  PERIODO: {
    critical: true,
    description: 'Datas devem estar dentro do período aprovado no PI',
  },

  VEICULO: {
    critical: true,
    description: 'Veículo deve ser exatamente o mesmo especificado no PI',
  },

  CLIENTE: {
    critical: true,
    description: 'Dados do cliente devem ser idênticos',
  },

  FORMATO: {
    critical: false,
    description: 'Formato deve ser compatível com o especificado no PI',
  },
};

export const SEVERITY_LEVELS = {
  CRITICO: {
    label: 'Crítico',
    description: 'Divergência que impede a aprovação do documento',
    color: 'red',
    examples: [
      'Valor divergente acima da tolerância',
      'Período fora do aprovado',
      'Veículo diferente do PI',
      'Cliente incorreto',
    ],
  },

  ATENCAO: {
    label: 'Atenção',
    description: 'Divergência que requer verificação mas pode ser justificável',
    color: 'yellow',
    examples: [
      'Valor com pequena diferença (dentro da tolerância)',
      'Descrição incompleta mas correta',
      'Formato similar mas não idêntico',
      'Data de emissão próxima mas não exata',
    ],
  },

  INFO: {
    label: 'Informativo',
    description: 'Observação que não impede aprovação',
    color: 'blue',
    examples: [
      'Campos opcionais não preenchidos',
      'Formatação diferente mas conteúdo correto',
      'Informações adicionais presentes',
    ],
  },

  OK: {
    label: 'OK',
    description: 'Documento está conforme o esperado',
    color: 'green',
    examples: [
      'Todos os campos batem com o PI',
      'Valores idênticos',
      'Período correto',
    ],
  },
};
