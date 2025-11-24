# 🚀 Sistema Híbrido de GPTs - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Como Usar](#como-usar)
5. [Templates Disponíveis](#templates-disponíveis)
6. [Upload de Documentos](#upload-de-documentos)
7. [Processamento e Embeddings](#processamento-e-embeddings)
8. [API e Integração](#api-e-integração)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Sistema Híbrido de GPTs** combina o melhor de dois mundos:

1. **Prompts Base** (código) - Comportamento consistente e otimizado
2. **Knowledge Base** (arquivos) - Conhecimento específico do cliente

### Benefícios

- ✅ **Rápido**: Templates pré-configurados para casos comuns
- ✅ **Flexível**: Upload de arquivos para conhecimento específico
- ✅ **Inteligente**: Busca semântica nos documentos
- ✅ **Escalável**: Cache de embeddings para performance
- ✅ **Econômico**: Otimização de tokens

---

## 🏗️ Arquitetura

### Fluxo Completo

```
┌─────────────────────────────────────────────────────┐
│                  Usuário                             │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           GPTManagementViewV2 (UI)                   │
│  - Seleção de template                               │
│  - Upload de documentos                              │
│  - Gerenciamento de knowledge base                   │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│          gptKnowledgeService                         │
│  - uploadDocument()                                  │
│  - processDocument()                                 │
│  - searchRelevantChunks()                            │
│  - getRelevantContext()                              │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           hybridGPTService                           │
│  - buildFullPrompt()                                 │
│  - callHybridGPT()                                   │
│  - callHybridGPTStream()                             │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              OpenAI GPT-4o                           │
│  - Recebe prompt completo                            │
│  - Gera resposta                                     │
└─────────────────────────────────────────────────────┘
```

### Estrutura de Dados

```
Firestore:
├── gpts/
│   ├── {gptId}/
│   │   ├── name
│   │   ├── description
│   │   ├── systemPrompt
│   │   ├── templateId (opcional)
│   │   └── ...
│
├── gpt_documents/
│   ├── {documentId}/
│   │   ├── gptId
│   │   ├── fileName
│   │   ├── fileType
│   │   ├── fileSize
│   │   ├── storageUrl
│   │   ├── processed
│   │   └── chunkCount
│
└── document_chunks/
    ├── {chunkId}/
    │   ├── documentId
    │   ├── gptId
    │   ├── content
    │   ├── embedding (array de 1536 números)
    │   └── chunkIndex

Firebase Storage:
└── gpt-documents/
    └── {gptId}/
        ├── {timestamp}_manual.pdf
        ├── {timestamp}_guidelines.docx
        └── ...
```

---

## 🧩 Componentes

### 1. gptKnowledgeService.ts

Gerencia upload e processamento de documentos.

#### Funções Principais

**uploadDocument(file, gptId, userId)**
- Valida tipo e tamanho do arquivo
- Faz upload para Firebase Storage
- Salva metadados no Firestore
- Retorna GPTDocument

**processDocument(documentId, file)**
- Extrai texto do arquivo
- Divide em chunks (máx 1000 caracteres)
- Gera embeddings com OpenAI
- Salva chunks no Firestore

**searchRelevantChunks(gptId, query, topK)**
- Gera embedding da query
- Busca todos os chunks do GPT
- Calcula similaridade de cosseno
- Retorna top K chunks mais relevantes

**getRelevantContext(gptId, query)**
- Busca chunks relevantes
- Formata como contexto
- Retorna string pronta para o prompt

#### Exemplo de Uso

```typescript
import { 
  uploadDocument, 
  processDocument, 
  getRelevantContext 
} from './services/gptKnowledgeService';

// Upload
const doc = await uploadDocument(file, gptId, userId);

// Processar
await processDocument(doc.id, file);

// Buscar contexto
const context = await getRelevantContext(gptId, 'Como criar um PI?');
```

---

### 2. gptTemplates.ts

Define templates pré-configurados.

#### Templates Disponíveis

1. **Criador de PI** (`criador-pi`)
   - Cria Pedidos de Inserção otimizados
   - Valida campos obrigatórios
   - Sugere distribuição de verba

2. **Analisador de Orçamento** (`analisador-orcamento`)
   - Analisa distribuição de verba
   - Compara com benchmarks
   - Sugere otimizações

3. **Gerador de Relatórios** (`gerador-relatorios`)
   - Gera relatórios completos
   - Análise de performance
   - Insights acionáveis

4. **Assistente de Checagem** (`assistente-checagem`)
   - Valida documentos
   - Identifica inconsistências
   - Sugere correções

5. **Assistente Financeiro** (`assistente-financeiro`)
   - Analisa fluxo de caixa
   - Calcula comissões
   - Gera alertas de pagamento

6. **Planejador de Mídia** (`planejador-midia`)
   - Cria planos de mídia
   - Otimiza mix de canais
   - Projeta resultados

#### Exemplo de Uso

```typescript
import { getTemplate, listTemplates } from './config/gptTemplates';

// Listar todos
const templates = listTemplates();

// Obter específico
const template = getTemplate('criador-pi');
console.log(template.basePrompt);
```

---

### 3. hybridGPTService.ts

Combina prompt base + conhecimento.

#### Funções Principais

**callHybridGPT(request)**
- Constrói prompt completo
- Combina base + contexto + mensagem
- Chama OpenAI
- Retorna resposta

**callHybridGPTStream(request)**
- Mesma lógica, mas com streaming
- Retorna AsyncGenerator
- Permite exibir resposta em tempo real

#### Exemplo de Uso

```typescript
import { callHybridGPT } from './services/hybridGPTService';

const response = await callHybridGPT({
  gptId: 'gpt123',
  userMessage: 'Crie um PI para campanha X',
  templateId: 'criador-pi',
  useKnowledgeBase: true
});

console.log(response.response);
console.log('Tokens usados:', response.tokensUsed);
```

---

### 4. GPTManagementViewV2.tsx

Interface para gerenciar GPTs.

#### Funcionalidades

- ✅ Criar GPT com template
- ✅ Editar GPT existente
- ✅ Fazer upload de documentos
- ✅ Visualizar knowledge base
- ✅ Processar documentos
- ✅ Deletar documentos

---

## 📖 Como Usar

### Passo 1: Criar GPT com Template

1. Acesse **"Gerenciar GPTs"**
2. Clique em **"Novo GPT"**
3. Escolha um template (ex: Criador de PI)
4. Preencha nome e descrição
5. Clique em **"Criar GPT"**

### Passo 2: Adicionar Documentos

1. Localize o GPT criado
2. Clique em **"Knowledge Base"**
3. Clique em **"Selecionar Arquivos"**
4. Escolha PDFs, DOCs ou TXTs (máx 10MB)
5. Aguarde processamento automático

### Passo 3: Usar o GPT

```typescript
import { callHybridGPT } from './services/hybridGPTService';

const response = await callHybridGPT({
  gptId: 'seu-gpt-id',
  userMessage: 'Sua pergunta aqui',
  useKnowledgeBase: true
});

console.log(response.response);
```

---

## 📚 Templates Disponíveis

### 1. Criador de PI

**Quando usar:**
- Criar novos Pedidos de Inserção
- Validar campos obrigatórios
- Otimizar distribuição de verba

**Arquivos sugeridos:**
- Manual de Marca do Cliente.pdf
- Histórico de Campanhas.xlsx
- Guidelines de Comunicação.pdf

**Exemplo de prompt:**
```
Crie um PI para o cliente Banco BRB:
- Campanha: Lançamento Produto X
- Verba: R$ 500.000
- Período: 01/01/2025 - 31/03/2025
- Objetivo: Awareness
```

---

### 2. Analisador de Orçamento

**Quando usar:**
- Analisar distribuição de verba
- Comparar com benchmarks
- Identificar oportunidades

**Arquivos sugeridos:**
- Histórico de Performance.xlsx
- Benchmarks de Mercado.pdf
- Tabelas de Preços.xlsx

**Exemplo de prompt:**
```
Analise esta distribuição de verba:
- TV: 50% (R$ 250k)
- Digital: 30% (R$ 150k)
- Rádio: 15% (R$ 75k)
- OOH: 5% (R$ 25k)

Sugira otimizações.
```

---

### 3. Gerador de Relatórios

**Quando usar:**
- Gerar relatórios de campanha
- Analisar performance
- Criar insights

**Arquivos sugeridos:**
- Dados de Performance.xlsx
- Objetivos da Campanha.pdf
- Histórico Comparativo.xlsx

**Exemplo de prompt:**
```
Gere um relatório da campanha X:
- Alcance: 5M impressões
- Engajamento: 150k cliques
- Conversões: 5k leads
- Investimento: R$ 500k
```

---

## 📤 Upload de Documentos

### Tipos Suportados

- ✅ **PDF** (.pdf)
- ✅ **Word** (.doc, .docx)
- ✅ **Texto** (.txt)

### Limites

- **Tamanho máximo:** 10MB por arquivo
- **Quantidade:** Ilimitada
- **Processamento:** Automático

### Fluxo de Upload

```
1. Usuário seleciona arquivo
   ↓
2. Validação (tipo e tamanho)
   ↓
3. Upload para Firebase Storage
   ↓
4. Salvar metadados no Firestore
   ↓
5. Extrair texto do arquivo
   ↓
6. Dividir em chunks (1000 chars)
   ↓
7. Gerar embeddings (OpenAI)
   ↓
8. Salvar chunks no Firestore
   ↓
9. Marcar como processado ✅
```

---

## 🔍 Processamento e Embeddings

### Como Funciona

1. **Extração de Texto**
   - TXT: Leitura direta
   - PDF/DOC: Placeholder (produção: usar bibliotecas)

2. **Divisão em Chunks**
   - Máximo: 1000 caracteres
   - Quebra por sentenças
   - Mantém contexto

3. **Geração de Embeddings**
   - Modelo: `text-embedding-3-small`
   - Dimensão: 1536
   - Custo: ~$0.00002 por 1000 tokens

4. **Busca Semântica**
   - Similaridade de cosseno
   - Top K chunks mais relevantes
   - Contexto formatado

### Exemplo de Chunk

```json
{
  "id": "chunk123",
  "documentId": "doc456",
  "gptId": "gpt789",
  "content": "O Banco BRB é uma instituição financeira...",
  "embedding": [0.123, -0.456, 0.789, ...], // 1536 números
  "chunkIndex": 0,
  "createdAt": "2025-01-24T10:00:00Z"
}
```

### Busca Semântica

```typescript
// Query do usuário
const query = "Quais são as cores da marca BRB?";

// Gerar embedding da query
const queryEmbedding = await generateEmbedding(query);

// Buscar chunks similares
const chunks = await searchRelevantChunks(gptId, query, 3);

// Resultado:
// [
//   { content: "As cores oficiais do BRB são azul e amarelo...", similarity: 0.92 },
//   { content: "O manual de marca define...", similarity: 0.85 },
//   { content: "Aplicações da marca...", similarity: 0.78 }
// ]
```

---

## 🔌 API e Integração

### Chamar GPT Híbrido

```typescript
import { callHybridGPT } from './services/hybridGPTService';

const response = await callHybridGPT({
  gptId: 'gpt123',
  userMessage: 'Crie um PI para campanha X',
  systemPrompt: 'Você é um especialista...', // Opcional
  templateId: 'criador-pi', // Opcional
  conversationHistory: [ // Opcional
    { role: 'user', content: 'Olá' },
    { role: 'assistant', content: 'Olá! Como posso ajudar?' }
  ],
  useKnowledgeBase: true, // Default: true
  model: 'gpt-4o' // Default: gpt-4o
});

console.log(response.response);
console.log('Tokens:', response.tokensUsed);
console.log('Usou KB:', response.usedKnowledgeBase);
```

### Streaming

```typescript
import { callHybridGPTStream } from './services/hybridGPTService';

const stream = callHybridGPTStream({
  gptId: 'gpt123',
  userMessage: 'Crie um PI para campanha X',
  templateId: 'criador-pi'
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Verificar Knowledge Base

```typescript
import { hasKnowledgeBase, getKnowledgeBaseStats } from './services/hybridGPTService';

// Verificar se tem documentos
const hasKB = await hasKnowledgeBase('gpt123');
console.log('Tem KB:', hasKB);

// Obter estatísticas
const stats = await getKnowledgeBaseStats('gpt123');
console.log('Documentos:', stats.documentCount);
console.log('Chunks:', stats.chunkCount);
console.log('Tamanho total:', stats.totalSize);
```

---

## 🔧 Troubleshooting

### Problema: "Tipo de arquivo não suportado"

**Causa:** Arquivo não é PDF, DOC, DOCX ou TXT

**Solução:**
- Converter arquivo para formato suportado
- Usar PDF como formato universal

---

### Problema: "Arquivo muito grande"

**Causa:** Arquivo maior que 10MB

**Solução:**
- Dividir arquivo em partes menores
- Comprimir PDF (remover imagens desnecessárias)
- Extrair apenas texto relevante

---

### Problema: "Erro ao processar documento"

**Causa:** Erro ao gerar embeddings ou salvar chunks

**Solução:**
1. Verificar API Key do OpenAI
2. Verificar conexão com internet
3. Tentar novamente
4. Verificar logs do console

---

### Problema: "GPT não usa conhecimento dos arquivos"

**Causa:** `useKnowledgeBase` = false ou sem chunks processados

**Solução:**
1. Verificar se documentos foram processados
2. Garantir que `useKnowledgeBase` = true
3. Verificar se chunks existem no Firestore

---

### Problema: "Resposta não relevante"

**Causa:** Chunks não são relevantes para a query

**Solução:**
1. Melhorar qualidade dos documentos
2. Adicionar mais documentos
3. Refinar a query do usuário
4. Ajustar topK (número de chunks)

---

## 📊 Métricas e Custos

### Custo de Processamento

**Por documento (1000 palavras):**
- Extração: Grátis
- Embeddings: ~$0.0002
- Storage: ~$0.000026/mês
- **Total:** ~$0.0002 + storage

**Por consulta:**
- Busca embeddings: Grátis (local)
- GPT-4o: ~$0.03 (2000 tokens)
- **Total:** ~$0.03

### Performance

**Upload:**
- Tempo: 1-3 segundos

**Processamento:**
- 1000 palavras: ~5 segundos
- 10000 palavras: ~30 segundos

**Consulta:**
- Busca: <100ms
- GPT-4o: 2-5 segundos

---

## 🚀 Próximos Passos

### Em Desenvolvimento

- 📄 Processamento completo de PDF (pdf-parse)
- 📝 Processamento completo de DOC (mammoth)
- 🔍 Busca avançada com filtros
- 📊 Dashboard de analytics
- 🔄 Re-processamento automático

### Roadmap

**Q1 2025:**
- ✅ Sistema híbrido base
- ⏳ Processamento completo de PDF/DOC
- ⏳ Interface de chat integrada

**Q2 2025:**
- ⏳ Fine-tuning automático
- ⏳ Multi-idioma
- ⏳ Análise de sentimento

**Q3 2025:**
- ⏳ Integração com APIs externas
- ⏳ Automação de workflows
- ⏳ Relatórios avançados

---

## 📝 Changelog

### v1.0.0 - 2025-01-24

**Lançamento Inicial**

- ✅ Sistema híbrido (prompt + KB)
- ✅ Upload de documentos
- ✅ Processamento com embeddings
- ✅ Busca semântica
- ✅ 6 templates pré-configurados
- ✅ Interface completa
- ✅ Cache de embeddings

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte esta documentação
2. Verifique a seção [Troubleshooting](#troubleshooting)
3. Entre em contato com a equipe

---

**Última atualização:** 24 de Janeiro de 2025  
**Versão:** 1.0.0  
**Autor:** Equipe CalixFlow
