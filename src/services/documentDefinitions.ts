/**
 * Definições e contexto sobre os tipos de documentos de mídia
 * Baseado em documentos reais fornecidos pelo cliente
 */

import { documentExamples } from './documentExamples';

export const DOCUMENT_DEFINITIONS = {
  PI: {
    name: 'PI - Pedido de Inserção',
    description: `
O Pedido de Inserção (PI) é o documento MESTRE que autoriza a veiculação de mídia.
É o documento de referência contra o qual TODOS os outros documentos devem ser validados.

ESTRUTURA COMPLETA DO PI:

1. INFORMAÇÕES DA AGÊNCIA:
   - Nome/Razão Social da agência de publicidade
   - CNPJ, Inscrição Estadual e Municipal
   - Endereço completo
   - Telefone/Fax

2. INFORMAÇÕES DO CLIENTE (Anunciante):
   - Nome/Razão Social do cliente
   - CNPJ, Inscrição Estadual e Municipal
   - Endereço completo
   - Praça de pagamento

3. INFORMAÇÕES DO VEÍCULO:
   - Nome do veículo (ex: KINOPLEX - MACEIÓ SHOPPING)
   - Praça (localização geográfica)
   - Rede (ex: FLIX MEDIA)
   - Razão Social do veículo
   - CNPJ do veículo
   - Endereço completo
   - E-mail para faturamento

4. DETALHES DA CAMPANHA:
   - Produto/Serviço anunciado
   - Título da peça
   - Nome da campanha
   - Formato (ex: 15", 30", banner, etc.)
   - Autorização do cliente
   - Número do processo (se aplicável)

5. VEICULAÇÃO:
   - Período de veiculação (data início e fim)
   - Número da AV (Autorização de Veiculação)
   - Data de vencimento
   - Posição/Praça
   - Detalhes técnicos (salas, horários, etc.)

6. VALORES:
   - Valor Unitário
   - Percentual de Desconto
   - Percentual de Acréscimo
   - Valor Total
   - Total Bruto
   - Desconto Padrão (20% - remuneração da agência conforme CENP)
   - Total Líquido

7. LOCAIS:
   - Local de entrega de NF/PF
   - Local de cobrança

8. CONDIÇÕES GERAIS:
   - Regras de veiculação
   - Prazos e condições
   - Orientações de faturamento

9. DOCUMENTOS NECESSÁRIOS PARA FATURAMENTO:
   - Lista de documentos que devem acompanhar a NF
   - Regras de preenchimento da NF
   - Informações obrigatórias

IMPORTÂNCIA CRÍTICA:
O PI é o documento MESTRE. TODOS os outros documentos (Nota Fiscal, Comprovante de Veiculação, 
Artigo 299, etc.) devem estar EXATAMENTE de acordo com o que está no PI.

Qualquer divergência deve ser justificada por escrito e aprovada pelo cliente.
    `.trim(),
    example: documentExamples.PI,
  },

  NOTA_FISCAL: {
    name: 'Nota Fiscal de Serviços (NFS-e)',
    description: `
A Nota Fiscal é o documento fiscal que comprova a prestação de serviço de veiculação.
No contexto de mídia, é emitida pelo VEÍCULO para cobrar o serviço prestado.

ESTRUTURA DA NOTA FISCAL:

1. DADOS DA NF:
   - Número da Nota
   - Data e Hora de Emissão
   - Código de Verificação
   - RPS (Recibo Provisório de Serviços)

2. PRESTADOR DE SERVIÇOS (Veículo):
   - Nome/Razão Social (DEVE ser IDÊNTICO ao do PI)
   - CNPJ (DEVE ser IDÊNTICO ao do PI)
   - Inscrição Municipal
   - Endereço completo
   - Município e UF

3. TOMADOR DE SERVIÇOS (Cliente):
   - Nome/Razão Social (DEVE ser IDÊNTICO ao do PI)
   - CNPJ (DEVE ser IDÊNTICO ao do PI)
   - Endereço
   - Município e UF

4. INTERMEDIÁRIO (se aplicável):
   - Dados da agência de publicidade

5. DISCRIMINAÇÃO DOS SERVIÇOS:
   DEVE conter obrigatoriamente:
   - Descrição: "Veiculação de Filme" ou similar
   - Agência responsável
   - Número do PI (ex: "Conforme PI: 60656")
   - Título da peça
   - Produto
   - Nome da campanha
   - Valor de referência do Desconto-Padrão (20% conforme CENP)
   - Valor Líquido
   - Valor Bruto
   - Data de vencimento

6. VALORES:
   - Valor Total do Serviço
   - Base de Cálculo
   - Alíquota (%)
   - Valor do ISS
   - Deduções (se aplicável)
   - Código do Serviço (ex: 02498 - Inserção de textos...)

7. OUTRAS INFORMAÇÕES:
   - Informações legais
   - Observações

VALIDAÇÕES CRÍTICAS:

1. RAZÃO SOCIAL E CNPJ:
   - Prestador: DEVE ser exatamente o VEÍCULO do PI
   - Tomador: DEVE ser exatamente o CLIENTE do PI
   - Qualquer diferença = CRÍTICO

2. VALORES:
   - Valor Líquido da NF DEVE ser igual ao Total Líquido do PI
   - Tolerância: máximo 1% (para arredondamentos)
   - Diferença > 1% = CRÍTICO

3. DISCRIMINAÇÃO:
   - DEVE mencionar o número do PI
   - DEVE mencionar o Desconto-Padrão (20%)
   - DEVE descrever o serviço corretamente

4. DATA DE EMISSÃO:
   - DEVE ser posterior ao término da veiculação
   - NF emitida antes da veiculação = CRÍTICO

5. VENCIMENTO:
   - DEVE ser "Contra Apresentação" ou conforme PI
   - Prazo diferente do PI = ATENÇÃO

DIVERGÊNCIAS COMUNS:

- Valor diferente (desconto não aplicado, taxa extra, erro de digitação)
- CNPJ do tomador errado (filial diferente)
- Descrição genérica sem mencionar o PI
- Falta do Desconto-Padrão na descrição
- Data de emissão antes da veiculação
- Código de serviço incorreto
    `.trim(),
    example: documentExamples.NotaFiscal,
  },

  CARTA_CORRECAO: {
    name: 'Carta de Correção de NF',
    description: `
A Carta de Correção é um documento que permite corrigir erros em uma NF já emitida,
sem precisar cancelar e emitir uma nova nota.

QUANDO USAR:
- Correção de descrição do serviço
- Correção de dados cadastrais simples
- Correção de informações complementares

O QUE NÃO PODE SER CORRIGIDO:
- Valores (base de cálculo, alíquota, valor do imposto)
- Número da nota e data de emissão
- Prestador ou tomador (alterações que mudem a natureza)
- Indicação de isenção ou imunidade
- Local de incidência do ISS

ESTRUTURA:
- Número da Carta de Correção
- Data de anexação
- Número da NF que está sendo corrigida
- Descrição: "ONDE LÊ SE: ... LEIA SE: ..."
- Dados do prestador e tomador
- Nota explicativa com as limitações legais

VALIDAÇÃO:
- Verificar se a correção é permitida por lei
- Verificar se não altera valores ou impostos
- Verificar se está devidamente assinada
    `.trim(),
    example: documentExamples.CartaCorrecao,
  },

  ARTIGO_299: {
    name: 'Declaração - Artigo 299 do Código Penal',
    description: `
Declaração formal, sob pena do Artigo 299 do Código Penal Brasileiro (falsidade ideológica),
que atesta que os serviços de veiculação foram efetivamente prestados.

IMPORTÂNCIA:
Esta declaração tem peso LEGAL. Quem assina está declarando, sob pena de processo criminal,
que a veiculação realmente aconteceu conforme descrito no PI.

ESTRUTURA:

1. CABEÇALHO:
   - Logo da empresa
   - Data da declaração
   - Destinatário (cliente)

2. CORPO DA DECLARAÇÃO:
   - Texto padrão mencionando o Art. 299 do Código Penal
   - Nome e CNPJ da empresa que prestou o serviço
   - Número do PI
   - Menção ao mapa comprovante de veiculação anexo

3. ASSINATURA:
   - Nome completo do responsável
   - Cargo
   - RG e CPF
   - Assinatura manuscrita ou digital

4. RODAPÉ:
   - CNPJ da empresa
   - Endereço completo
   - Contatos

VALIDAÇÕES:

1. DEVE mencionar o número do PI correto
2. DEVE estar assinada por pessoa autorizada
3. DEVE ter RG e CPF do signatário
4. DEVE mencionar que há mapa de veiculação anexo
5. Data DEVE ser posterior à veiculação

OBSERVAÇÃO IMPORTANTE:
Este documento é uma DECLARAÇÃO LEGAL. Falsificar ou declarar informações
incorretas é CRIME previsto no Art. 299 do Código Penal, com pena de 1 a 5 anos
de reclusão.

Artigo 299 - Código Penal:
"Omitir, em documento público ou particular, declaração que dele devia constar, 
ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, 
com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato 
juridicamente relevante."
    `.trim(),
    example: documentExamples.Artigo299,
  },

  COMPROVANTE_VEICULACAO: {
    name: 'Comprovante de Veiculação',
    description: `
Documento que comprova que a mídia realmente foi ao ar/publicada.
Pode ser um print, screenshot, gravação, foto, ou certificado do veículo.

TIPOS DE COMPROVANTE POR MÍDIA:

1. TV:
   - Gravação do comercial no ar
   - Print do sistema de programação
   - Certificado do veículo com data/hora

2. RÁDIO:
   - Gravação do spot
   - Certificado do veículo

3. JORNAL/REVISTA:
   - Foto da página publicada
   - Exemplar físico
   - PDF da edição

4. DIGITAL:
   - Screenshots com data/hora
   - Relatórios de impressões
   - Links das peças

5. CINEMA:
   - Relatório de exibição por sala
   - Fotos da tela
   - Certificado do circuito

INFORMAÇÕES OBRIGATÓRIAS:

- Data e hora exata da veiculação
- Veículo/canal/site
- Programa/seção/página
- Formato (duração, tamanho, posição)
- Evidência visual ou auditiva

VALIDAÇÕES:

1. Data DEVE estar no período do PI
2. Veículo DEVE ser o mesmo do PI
3. Formato DEVE ser compatível com o PI
4. Quantidade de inserções DEVE bater com o PI
5. Horário DEVE estar na faixa aprovada (se especificado)

DIVERGÊNCIAS COMUNS:

- Veiculação fora do período
- Quantidade diferente de inserções
- Formato diferente do aprovado
- Horário fora da faixa contratada
- Falta de evidência clara
    `.trim(),
  },

  MAPA_MIDIA: {
    name: 'Mapa de Mídia',
    description: `
Planejamento detalhado da campanha, mostrando quando e onde cada peça será veiculada.
É o documento de PLANEJAMENTO que origina o PI.

ESTRUTURA:

1. INFORMAÇÕES GERAIS:
   - Cliente
   - Produto/Campanha
   - Período total
   - Investimento total

2. DETALHAMENTO POR VEÍCULO:
   - Nome do veículo
   - Praça
   - Formato
   - Datas de veiculação
   - Quantidade de inserções
   - Valor por inserção
   - Valor total por veículo

3. MÉTRICAS (quando aplicável):
   - GRP/TRP (TV/Rádio)
   - Alcance e Frequência
   - Impressões (Digital)
   - Tiragem/Circulação (Impresso)

4. RESUMO:
   - Total de inserções
   - Investimento total
   - Distribuição por mídia
   - Distribuição por período

VALIDAÇÕES:

1. Soma dos valores por veículo DEVE bater com total do PI
2. Período DEVE estar dentro do PI
3. Veículos listados DEVEM estar nos PIs correspondentes
4. Formatos DEVEM ser compatíveis com os PIs

OBSERVAÇÃO:
O Mapa de Mídia é geralmente criado ANTES dos PIs. Cada linha do mapa
pode gerar um PI separado.
    `.trim(),
  },
};

export const VALIDATION_RULES = {
  VALOR: {
    tolerance: 0.01, // 1% de tolerância para arredondamentos
    critical: true,
    description: 'Valores devem ser idênticos ou dentro da tolerância de 1%',
    examples: [
      'PI: R$ 2.335,87 vs NF: R$ 2.335,87 = OK',
      'PI: R$ 2.335,87 vs NF: R$ 2.340,00 = OK (diferença de 0,18%)',
      'PI: R$ 2.335,87 vs NF: R$ 2.500,00 = CRÍTICO (diferença de 7%)',
    ],
  },

  PERIODO: {
    critical: true,
    description: 'Datas devem estar dentro do período aprovado no PI',
    examples: [
      'PI: 01/10/2023 a 31/10/2023 vs Veiculação: 15/10/2023 = OK',
      'PI: 01/10/2023 a 31/10/2023 vs Veiculação: 05/11/2023 = CRÍTICO',
      'NF emitida em 03/05/2024 para veiculação até 31/10/2023 = OK (posterior)',
      'NF emitida em 01/10/2023 para veiculação até 31/10/2023 = CRÍTICO (antes)',
    ],
  },

  VEICULO: {
    critical: true,
    description: 'Veículo deve ser exatamente o mesmo especificado no PI',
    examples: [
      'PI: FLIX MEDIA (CNPJ: 14.173.345/0001-51) vs NF: FLIX MEDIA (CNPJ: 14.173.345/0001-51) = OK',
      'PI: FLIX MEDIA (CNPJ: 14.173.345/0001-51) vs NF: FLIX MEDIA (CNPJ: 14.173.345/0002-32) = CRÍTICO (filial diferente)',
    ],
  },

  CLIENTE: {
    critical: true,
    description: 'Dados do cliente devem ser idênticos',
    examples: [
      'PI: MINISTÉRIO DA SAÚDE (CNPJ: 00.394.544/0036-05) vs NF: MINISTÉRIO DA SAÚDE (CNPJ: 00.394.544/0036-05) = OK',
      'PI: MINISTÉRIO DA SAÚDE vs NF: MIN. SAÚDE = ATENÇÃO (abreviação)',
      'PI: MINISTÉRIO DA SAÚDE (CNPJ: 00.394.544/0036-05) vs NF: MINISTÉRIO DA SAÚDE (CNPJ: 00.394.544/0001-23) = CRÍTICO (CNPJ diferente)',
    ],
  },

  FORMATO: {
    critical: false,
    description: 'Formato deve ser compatível com o especificado no PI',
    examples: [
      'PI: 15" vs Comprovante: 15" = OK',
      'PI: 15" vs Comprovante: 30" = CRÍTICO',
      'PI: Banner 728x90 vs Comprovante: Banner 728x90 = OK',
    ],
  },

  DESCRICAO_NF: {
    critical: true,
    description: 'Discriminação da NF deve mencionar o PI e o Desconto-Padrão',
    examples: [
      'Contém "Conforme PI: 60656" e "Desconto-Padrão" = OK',
      'Contém "Conforme PI: 60656" mas não menciona "Desconto-Padrão" = ATENÇÃO',
      'Não menciona o PI = CRÍTICO',
    ],
  },
};

export const SEVERITY_LEVELS = {
  CRITICO: {
    label: 'Crítico',
    icon: '⛔',
    description: 'Divergência que IMPEDE a aprovação do documento. Requer correção imediata.',
    color: 'red',
    examples: [
      'Valor divergente acima de 1% de tolerância',
      'Período de veiculação fora do aprovado no PI',
      'Veículo diferente do especificado no PI',
      'CNPJ do cliente ou veículo incorreto',
      'NF emitida antes da veiculação',
      'Falta do número do PI na descrição da NF',
      'Razão Social diferente',
    ],
    action: 'REJEITAR documento e solicitar correção',
  },

  ATENCAO: {
    label: 'Atenção',
    icon: '⚠️',
    description: 'Divergência que requer verificação mas pode ser justificável. Requer análise.',
    color: 'yellow',
    examples: [
      'Valor com pequena diferença (dentro da tolerância de 1%)',
      'Descrição incompleta mas com informações essenciais',
      'Formato similar mas não idêntico',
      'Data de emissão próxima mas não exata',
      'Falta do Desconto-Padrão na descrição',
      'Endereço com pequenas diferenças',
      'Nome abreviado mas reconhecível',
    ],
    action: 'REVISAR e solicitar justificativa ou correção',
  },

  INFO: {
    label: 'Informativo',
    icon: 'ℹ️',
    description: 'Observação que não impede aprovação. Apenas para conhecimento.',
    color: 'blue',
    examples: [
      'Campos opcionais não preenchidos',
      'Formatação diferente mas conteúdo correto',
      'Informações adicionais presentes',
      'Ordem dos campos diferente',
      'Uso de abreviações padronizadas',
    ],
    action: 'APROVAR com ressalvas documentadas',
  },

  OK: {
    label: 'Conforme',
    icon: '✅',
    description: 'Documento está 100% conforme o esperado. Aprovado.',
    color: 'green',
    examples: [
      'Todos os campos batem exatamente com o PI',
      'Valores idênticos',
      'Período correto',
      'CNPJ e Razão Social corretos',
      'Descrição completa com PI e Desconto-Padrão',
    ],
    action: 'APROVAR documento',
  },
};

export const COMMON_ISSUES = {
  VALOR_DIVERGENTE: {
    title: 'Valor Divergente',
    description: 'O valor da NF não bate com o valor do PI',
    possibleCauses: [
      'Desconto não aplicado corretamente',
      'Taxa ou imposto adicional não previsto',
      'Erro de digitação',
      'Uso do valor bruto ao invés do líquido',
      'Arredondamento incorreto',
    ],
    solution: 'Verificar cálculo e solicitar correção ou carta de correção',
  },

  CNPJ_ERRADO: {
    title: 'CNPJ Incorreto',
    description: 'CNPJ do cliente ou veículo não bate com o PI',
    possibleCauses: [
      'Filial diferente da especificada',
      'Matriz ao invés de filial (ou vice-versa)',
      'Erro de digitação',
      'Mudança de CNPJ não comunicada',
    ],
    solution: 'CRÍTICO - Solicitar cancelamento e reemissão da NF',
  },

  FALTA_PI: {
    title: 'Falta Número do PI',
    description: 'Descrição da NF não menciona o número do PI',
    possibleCauses: [
      'Esquecimento',
      'Falta de orientação ao veículo',
      'Uso de template genérico',
    ],
    solution: 'Solicitar carta de correção incluindo o número do PI',
  },

  DATA_ERRADA: {
    title: 'Data de Emissão Incorreta',
    description: 'NF emitida antes da veiculação',
    possibleCauses: [
      'Antecipação indevida',
      'Erro de sistema',
      'Confusão de datas',
    ],
    solution: 'CRÍTICO - Solicitar cancelamento e reemissão após veiculação',
  },
};

export default DOCUMENT_DEFINITIONS;
