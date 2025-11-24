/**
 * Hybrid GPT Service - Combina prompt base + conhecimento de arquivos
 * 
 * Sistema híbrido que:
 * 1. Usa prompt base do template/GPT
 * 2. Busca conhecimento relevante nos arquivos
 * 3. Combina tudo em um prompt otimizado
 * 4. Envia para OpenAI e retorna resposta
 */

import OpenAI from 'openai';
import { getRelevantContext } from './gptKnowledgeService';
import { getTemplate } from '../config/gptTemplates';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface HybridGPTRequest {
  gptId: string;
  userMessage: string;
  systemPrompt?: string; // Prompt customizado do GPT
  templateId?: string; // ID do template (se usar template)
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  useKnowledgeBase?: boolean; // Se deve buscar nos arquivos
  model?: string;
}

export interface HybridGPTResponse {
  response: string;
  tokensUsed: number;
  model: string;
  usedKnowledgeBase: boolean;
  relevantChunks?: number;
}

/**
 * Constrói o prompt completo combinando base + contexto + mensagem
 */
async function buildFullPrompt(request: HybridGPTRequest): Promise<string> {
  let fullPrompt = '';

  // 1. Prompt Base (do template ou customizado)
  if (request.templateId) {
    const template = getTemplate(request.templateId);
    if (template) {
      fullPrompt += template.basePrompt + '\n\n';
    }
  } else if (request.systemPrompt) {
    fullPrompt += request.systemPrompt + '\n\n';
  }

  // 2. Conhecimento Base (dos arquivos)
  if (request.useKnowledgeBase !== false) {
    const context = await getRelevantContext(request.gptId, request.userMessage);
    if (context) {
      fullPrompt += context + '\n\n';
    }
  }

  // 3. Histórico de Conversa
  if (request.conversationHistory && request.conversationHistory.length > 0) {
    fullPrompt += 'HISTÓRICO DA CONVERSA:\n';
    request.conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }

  // 4. Mensagem do Usuário
  fullPrompt += `MENSAGEM ATUAL DO USUÁRIO:\n${request.userMessage}`;

  return fullPrompt;
}

/**
 * Chama o GPT híbrido
 */
export async function callHybridGPT(request: HybridGPTRequest): Promise<HybridGPTResponse> {
  try {
    // Construir prompt completo
    const fullPrompt = await buildFullPrompt(request);

    console.log('[HybridGPT] Chamando OpenAI...');
    console.log('[HybridGPT] Tamanho do prompt:', fullPrompt.length, 'caracteres');

    // Preparar mensagens
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: fullPrompt
      },
      {
        role: 'user',
        content: request.userMessage
      }
    ];

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: request.model || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log('[HybridGPT] Resposta recebida:', response.length, 'caracteres');
    console.log('[HybridGPT] Tokens usados:', tokensUsed);

    return {
      response,
      tokensUsed,
      model: completion.model,
      usedKnowledgeBase: request.useKnowledgeBase !== false,
      relevantChunks: 0 // TODO: contar chunks usados
    };

  } catch (error) {
    console.error('[HybridGPT] Erro ao chamar GPT:', error);
    throw error;
  }
}

/**
 * Chama o GPT híbrido com streaming
 */
export async function* callHybridGPTStream(
  request: HybridGPTRequest
): AsyncGenerator<string, void, unknown> {
  try {
    // Construir prompt completo
    const fullPrompt = await buildFullPrompt(request);

    console.log('[HybridGPT] Chamando OpenAI com streaming...');

    // Preparar mensagens
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: fullPrompt
      },
      {
        role: 'user',
        content: request.userMessage
      }
    ];

    // Chamar OpenAI com streaming
    const stream = await openai.chat.completions.create({
      model: request.model || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    });

    // Yield cada chunk da resposta
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

  } catch (error) {
    console.error('[HybridGPT] Erro ao chamar GPT com streaming:', error);
    throw error;
  }
}

/**
 * Valida se um GPT tem conhecimento base configurado
 */
export async function hasKnowledgeBase(gptId: string): Promise<boolean> {
  try {
    const { listDocuments } = await import('./gptKnowledgeService');
    const documents = await listDocuments(gptId);
    return documents.length > 0;
  } catch (error) {
    console.error('[HybridGPT] Erro ao verificar knowledge base:', error);
    return false;
  }
}

/**
 * Obtém estatísticas do knowledge base
 */
export async function getKnowledgeBaseStats(gptId: string): Promise<{
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}> {
  try {
    const { listDocuments } = await import('./gptKnowledgeService');
    const documents = await listDocuments(gptId);

    const documentCount = documents.length;
    const chunkCount = documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

    return {
      documentCount,
      chunkCount,
      totalSize
    };
  } catch (error) {
    console.error('[HybridGPT] Erro ao obter estatísticas:', error);
    return {
      documentCount: 0,
      chunkCount: 0,
      totalSize: 0
    };
  }
}
