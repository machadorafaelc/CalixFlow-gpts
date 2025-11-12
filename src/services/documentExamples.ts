/**
 * Exemplos reais de documentos de mídia
 * Baseados em documentos fornecidos pelo cliente
 */

export const documentExamples = {
  PI: {
    title: 'Exemplo Real de PI - Pedido de Inserção (Cinema)',
    number: '60656',
    data: {
      // Informações da Agência
      agencia: {
        nome: 'AGÊNCIA NACIONAL DE PROPAGANDA LTDA',
        cnpj: '61.704.482/0004-06',
        inscricaoEstadual: 'ISENTO',
        inscricaoMunicipal: '07.503.873/003-26',
        endereco: 'Q SGAN 601 CONJUNTO H SALA 21 A 28 SS 2, ASA NORTE (70.830-018), BRASÍLIA, DF',
        telefone: '(61) 3034-1303'
      },
      
      // Informações do Cliente
      cliente: {
        nome: 'MINISTÉRIO DA SAÚDE - COORD. GERAL DE MATERIAL E PATRIMÔNIO',
        razaoSocial: 'MINISTÉRIO DA SAÚDE',
        cnpj: '00.394.544/0036-05',
        inscricaoEstadual: 'ISENTO',
        inscricaoMunicipal: '',
        endereco: 'ESPLANADA DOS MINISTÉRIOS BLOCO G ANEXO ALA A, G-317-ANDAR-3 ANDAR, ASA SUL (70.)',
        pracaPagto: 'BRASÍLIA - 70.830-018'
      },
      
      // Informações do Veículo
      veiculo: {
        nome: 'KINOPLEX - MACEIÓ SHOPPING',
        praca: 'AL-MACEIO',
        rede: 'FLIX MEDIA',
        razaoSocial: 'FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA',
        cnpj: '14.173.345/0001-51',
        endereco: 'R OLIMPÍADAS, NÚMERO 205-SALA 92 E 93 COND CONTINENTAL SQUARE, VILA OLÍMPIA (04.551-000), SÃO PAULO, SP',
        email: 'FLIXFATURAMENTO@FLIXMEDIA.COM.BR; FINANCEIRO@FLIXMEDIA.COM.BR'
      },
      
      // Detalhes da Campanha
      campanha: {
        produto: 'UTILIDADE PÚBLICA',
        titulo: 'ZÉ GOTINHA AL',
        nome: 'CAMPANHA NACIONAL DE MULTIVACINAÇÃO ALAGOAS 2023-NACIONAL',
        formato: '15"',
        autorizacaoCliente: '',
        numeroProcesso: ''
      },
      
      // Veiculação
      veiculacao: {
        veiculacao: 'OUTUBRO/2023',
        numeroAV: 'AV.2023.00656.00003',
        vencimento: '31/10/2023',
        posicao: 'KIN - MACEIÓ SHOPPING',
        formato: '15"',
        titulo: 'MULTIVACINAÇÃO ALAGOAS',
        periodo: {
          inicio: '31/10/2023',
          fim: '31/10/2023'
        },
        salas: {
          tipo: 'SALA PREMIUM',
          periodo: 'PERÍODO DE VEICULAÇÃO: 05 A 18/10 - 14 DIAS (2 CINE SEMANAS)',
          salasProgramadas: 6,
          totalSalas: 12
        }
      },
      
      // Valores
      valores: {
        valorUnitario: 72996.00,
        percentualDesconto: 96.0000,
        percentualAcrescimo: 0.0000,
        valorTotal: 2919.84,
        totalBruto: 2919.84,
        descontoPadrao: 583.97,
        totalLiquido: 2335.87
      },
      
      // Locais
      locais: {
        entregaNFPF: 'Q SGAN 601 CONJUNTO H SALA 21 A 28 SS 2, 70.830-018), BRASÍLIA, DF',
        cobranca: 'Q SGAN 601 CONJUNTO H SALA 21 A 28 SS 2, 70.830-018), BRASÍLIA, DF'
      },
      
      // Condições Gerais
      condicoesGerais: [
        'Confira os dados do PI e, em caso de irregularidade, entre em contato imediatamente com a agência.',
        'Não é permitido veiculação fora da faixa horária constante no PI.',
        'Não é permitido o remanejamento de inserções sem o devido consentimento prévio e por escrito da mídia da agência.'
      ],
      
      // Documentos Necessários
      documentosNecessarios: [
        'Razão Social do Veículo e CNPJ devem ser idênticos aos do PI',
        'Razão Social do Anunciante, endereço e CNPJ do PI MINISTÉRIO DA SAÚDE idênticos ao PEDIDO DE INSERÇÃO – PI',
        'Data da emissão da NF deve ser posterior ao término da veiculação',
        'Descrição do Serviço: Veiculação de Filme',
        'Vencimento: Contra Apresentação e Dados Bancários em nome da Pessoa Jurídica',
        'O valor total da nota dever ser o Valor Faturado do PI',
        'Valor de referência ao Desconto-Padrão (remuneração da Agência - Item 1.11 das Normas Padrão da Atividade Publicitária): (R$ XXXX ref. a 20% conforme CENP)'
      ]
    },
    
    // Texto completo para contexto
    fullText: `
PI - PEDIDO DE INSERÇÃO (CINEMA)
PI NÚMERO: 60656 - NORMAL
EMITIDO EM: 29/09/2023 18:02:43

AGÊNCIA NACIONAL - BRASÍLIA
AGÊNCIA NACIONAL DE PROPAGANDA LTDA
CNPJ: 61.704.482/0004-06 - INSCRIÇÃO ESTADUAL: ISENTO - INSCRIÇÃO MUNICIPAL: 07.503.873/003-26
Q SGAN 601 CONJUNTO H SALA 21 A 28 SS 2, ASA NORTE (70.830-018), BRASÍLIA, DF
FONE/FAX: (61) 3034-1303

CLIENTE: MINISTÉRIO DA SAÚDE - COORD. GERAL DE MATERIAL E PATRIMÔNIO
RAZÃO SOCIAL: MINISTÉRIO DA SAÚDE
CNPJ: 00.394.544/0036-05 - INSCRIÇÃO ESTADUAL: ISENTO - INSCRIÇÃO MUNICIPAL:
ENDEREÇO: ESPLANADA DOS MINISTÉRIOS BLOCO G ANEXO ALA A, G-317-ANDAR-3 ANDAR, ASA SUL (70.)
PRAÇA DE PAGTO: BRASÍLIA - 70.830-018

VEÍCULO: KINOPLEX - MACEIÓ SHOPPING
PRAÇA: AL-MACEIO REDE: FLIX MEDIA
RAZÃO SOCIAL: FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA
CNPJ: 14.173.345/0001-51
ENDEREÇO: R OLIMPÍADAS, NÚMERO 205-SALA 92 E 93 COND CONTINENTAL SQUARE, VILA OLÍMPIA (04.551-000), SÃO PAULO, SP

PRODUTO: UTILIDADE PÚBLICA
CAMPANHA: CAMPANHA NACIONAL DE MULTIVACINAÇÃO ALAGOAS 2023-NACIONAL

VEICULAÇÃO: OUTUBRO/2023
Nº AV: AV.2023.00656.00003
VENCIMENTO: 31/10/2023

Posição: KIN - MACEIÓ SHOPPING
Formato: 15"
Título: MULTIVACINAÇÃO ALAGOAS
Período: 31/10/2023 a 31/10/2023

Valor Unitário: R$ 72.996,00
% Desc.: 96,0000
% Acrésc.: 0,0000
Valor Total: R$ 2.919,84

PRAZO DE PAGTO: 31/10/2023
VENCIMENTO: 31/10/2023
Total Bruto: R$ 2.919,84
Desconto Padrão: R$ 583,97
Total Líquido: R$ 2.335,87
    `
  },
  
  NotaFiscal: {
    title: 'Exemplo Real de Nota Fiscal de Serviços',
    number: '00030314',
    data: {
      // Informações da NF
      numero: '00030314',
      dataEmissao: '03/05/2024 17:24:17',
      codigoVerificacao: 'FA4N-BXQS',
      rps: 'RPS Nº 303.14 Série 00001, emitido em 03/05/2024',
      
      // Prestador
      prestador: {
        nome: 'FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA',
        cnpj: '14.173.345/0001-51',
        inscricaoMunicipal: '4.360.111-1',
        endereco: 'R OLIMPÍADAS 205, COND CONTSQUAREFARIAL - VILA OLÍMPIA - CEP: 04551-000',
        municipio: 'São Paulo',
        uf: 'SP'
      },
      
      // Tomador
      tomador: {
        nome: 'MINISTÉRIO DA SAÚDE',
        cnpj: '00.394.544/0036-05',
        inscricaoMunicipal: '----',
        endereco: 'ESP MINISTÉRIOS BL G s/317, ANEXO A SL 420A - ZONA CÍVICO-ADMINISTRATIVA - CEP: 70058-900',
        municipio: 'Brasília',
        uf: 'DF'
      },
      
      // Serviço
      servico: {
        discriminacao: `Veiculação de Filme (Obra Cinematográfica) de Conteúdo Publicitário.
Agência: AGÊNCIA NACIONAL DE PROPAGANDA LTDA
Conforme PI: 60656
Título(s): ZÉ GOTINHA AL
Produto(s): Mídia em tela
CAMPANHA: CAMPANHA NACIONAL DE MULTIVACINAÇÃO ALAGOAS 2023-NACIONAL
Valor de referência do Desconto-Padrão (remuneração da agência - item 1.11 das Normas Padrão da Atividade Publicitária): R$ 583,97`,
        valorLiquido: 2335.87,
        valorBruto: 2919.84,
        dataVencimento: '30/05/2024',
        codigoServico: '02498 - Inserção de textos, desenhos e outros materiais de propaganda e publicidade, em qualquer meio',
        baseCalculo: 2335.87,
        aliquota: 2.90,
        valorISS: 67.74
      }
    },
    
    fullText: `
PREFEITURA DO MUNICÍPIO DE SÃO PAULO
SECRETARIA MUNICIPAL DA FAZENDA
NOTA FISCAL ELETRÔNICA DE SERVIÇOS - NFS-e

Número da Nota: 00030314
Data e Hora de Emissão: 03/05/2024 17:24:17
Código de Verificação: FA4N-BXQS

PRESTADOR DE SERVIÇOS
CNPJ: 14.173.345/0001-51
Inscrição Municipal: 4.360.111-1
Nome/Razão Social: FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA
Endereço: R OLIMPÍADAS 205, COND CONTSQUAREFARIAL - VILA OLÍMPIA - CEP: 04551-000
Município: São Paulo - UF: SP

TOMADOR DE SERVIÇOS
Nome/Razão Social: MINISTÉRIO DA SAÚDE
CNPJ: 00.394.544/0036-05
Endereço: ESP MINISTÉRIOS BL G s/317, ANEXO A SL 420A - ZONA CÍVICO-ADMINISTRATIVA - CEP: 70058-900
Município: Brasília - UF: DF

DISCRIMINAÇÃO DOS SERVIÇOS
Veiculação de Filme (Obra Cinematográfica) de Conteúdo Publicitário.
Agência: AGÊNCIA NACIONAL DE PROPAGANDA LTDA
Conforme PI: 60656
Título(s): ZÉ GOTINHA AL
Produto(s): Mídia em tela
CAMPANHA: CAMPANHA NACIONAL DE MULTIVACINAÇÃO ALAGOAS 2023-NACIONAL
Valor de referência do Desconto-Padrão (remuneração da agência - item 1.11 das Normas Padrão da Atividade Publicitária): R$ 583,97
Valor Líquido: R$ 2.335,87
Valor Bruto: R$ 2.919,84
Data de vencimento: 30/05/2024

VALOR TOTAL DO SERVIÇO = R$ 2.335,87
Código do Serviço: 02498 - Inserção de textos, desenhos e outros materiais de propaganda e publicidade, em qualquer meio
Base de Cálculo: R$ 2.335,87
Alíquota: 2,90%
Valor do ISS: R$ 67,74
    `
  },
  
  CartaCorrecao: {
    title: 'Exemplo de Carta de Correção de NF',
    number: '1',
    data: {
      numeroNF: '00030314',
      dataEmissao: '03/05/2024 17:24:17',
      numeroCartaCorrecao: 'Nº 1 - ANEXADA EM 08/05/2024',
      descricao: 'ONDE LÊ SE: Produto (s): Mídia em tela\nLEIA SE: Sala de cinema',
      prestador: {
        nome: 'FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA',
        cnpj: '14.173.345/0001-51',
        inscricaoMunicipal: '4.360.111-1',
        endereco: 'R OLIMPÍADAS 205, COND CONTSQUAREFARIAL - VILA OLÍMPIA - CEP: 04551-000',
        municipio: 'São Paulo',
        uf: 'SP'
      },
      tomador: {
        nome: 'MINISTÉRIO DA SAÚDE',
        cnpj: '00.394.544/0036-05',
        endereco: 'ESP MINISTÉRIOS BL G s/317, ANEXO A SL 420A - ZONA CÍVICO-ADMINISTRATIVA - CEP: 70058-900',
        municipio: 'Brasília',
        uf: 'DF'
      }
    },
    
    fullText: `
PREFEITURA DO MUNICÍPIO DE SÃO PAULO
SECRETARIA MUNICIPAL DA FAZENDA
CARTA DE CORREÇÃO
Nº 1 - ANEXADA EM 08/05/2024

Número da Nota: 00030314
Data e Hora de Emissão: 03/05/2024 17:24:17
Código de Verificação: FA4N-BXQS

PRESTADOR DE SERVIÇOS
CNPJ: 14.173.345/0001-51
Nome/Razão Social: FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA
Endereço: R OLIMPÍADAS 205, COND CONTSQUAREFARIAL - VILA OLÍMPIA - CEP: 04551-000
Município: São Paulo - UF: SP

TOMADOR DE SERVIÇOS
Nome/Razão Social: MINISTÉRIO DA SAÚDE
CNPJ: 00.394.544/0036-05
Endereço: ESP MINISTÉRIOS BL G s/317, ANEXO A SL 420A - ZONA CÍVICO-ADMINISTRATIVA - CEP: 70058-900
Município: Brasília - UF: DF

DESCRIÇÃO
ONDE LÊ SE: Produto (s): Mídia em tela
LEIA SE: Sala de cinema

NOTA EXPLICATIVA
A Carta de Correção, em acordo ao art. 4º da Instrução Normativa SF/SUREM 022, de 09/10/2007, permite a regularização de
erro ocorrido na emissão de NFS-e, DESDE QUE O ERRO NÃO ESTEJA RELACIONADO COM:

I - as variáveis que determinam o valor do imposto tais como: base de cálculo, alíquota, valor das deduções, código de serviço,
diferença de preço, quantidade e valor da prestação de serviços;
II - a correção de dados cadastrais que implique qualquer alteração do prestador ou tomador de serviços;
III - o número da nota e a data de emissão;
IV - a indicação de isenção ou imunidade relativa ao ISS;
V - a indicação da existência de ação judicial relativa ao ISS;
VI - a indicação do local de incidência do ISS;
VII - a indicação da responsabilidade pelo recolhimento do ISS;
VIII - o número e a data de emissão do Recibo Provisório de Serviços – RPS.
    `
  },
  
  Artigo299: {
    title: 'Exemplo de Declaração - Artigo 299',
    data: {
      data: '02 de maio de 2024',
      destinatario: 'MINISTÉRIO DA SAÚDE',
      empresa: {
        nome: 'FLIX MEDIA PUBLICIDADE E ENTRETENIMENTO LTDA',
        cnpj: '14.173.345/0001-51',
        endereco: 'Rua Olimpíadas nº 205 - 9º andar, Vila Olímpia - CEP 04551-000, São Paulo - SP'
      },
      numeroPI: '60656',
      responsavel: {
        nome: 'ALESSANDRA DA SILVA VIEIRA',
        cargo: 'Coordenadora de OPEC e Programação',
        rg: '26.360.397-0',
        cpf: '263.228.378-77'
      }
    },
    
    fullText: `
São Paulo, 02 de maio de 2024.

Ao MINISTÉRIO DA SAÚDE

Declaramos, sob pena do art. 299 do Código Penal Brasileiro, que esta empresa, FLIX MEDIA
PUBLICIDADE E ENTRETENIMENTO LTDA, inscrita no CNPJ sob o nº 14.173.345/0001-51, prestou
os serviços de publicidade objeto do PI 60656, mediante as seguintes veiculações descritas no
mapa comprovante de veiculação anexo.

Atenciosamente,

[Assinatura]

ALESSANDRA DA SILVA VIEIRA
Coordenadora de OPEC e Programação
RG 26.360.397-0
CPF: 263.228.378-77

---

14.173.345/0001-51
FLIX MEDIA PUBLICIDADE
E ENTRETENIMENTO LTDA.
Rua Olimpíadas nº 205 - 9º andar
Vila Olímpia - CEP 04551-000
São Paulo - SP
    `
  }
};

export default documentExamples;
