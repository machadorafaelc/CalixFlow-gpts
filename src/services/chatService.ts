/**
 * Serviço de Chat com OpenAI
 * 
 * Gerencia interações com a API da OpenAI para chat
 */

import OpenAI from 'openai';
import { Message } from '../types/firestore';
import ragService from './ragService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class ChatService {
  private openai: OpenAI;
  private defaultModel = 'gpt-4o-mini';
  private defaultTemperature = 0.7;
  private defaultMaxTokens = 2000;
  
  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'sua-nova-chave-openai-aqui' || apiKey === 'sua-chave-openai-aqui') {
      console.error('❌ Chave OpenAI não configurada ou inválida');
      throw new Error('VITE_OPENAI_API_KEY não configurada. Adicione a chave OpenAI nas variáveis de ambiente.');
    }
    
    console.log('✅ ChatService inicializado com chave OpenAI');
    
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Apenas para desenvolvimento/teste
    });
  }
  
  /**
   * Analisar imagem com GPT-4o-mini Vision
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string = 'Descreva esta imagem em detalhes.'
  ): Promise<string> {
    try {
      console.log('Analisando imagem com Vision...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
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
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ] as any,
        max_tokens: 1000
      });
      
      const description = response.choices[0]?.message?.content || '';
      console.log('Análise concluída:', description.substring(0, 100) + '...');
      
      return description;
      
    } catch (error: any) {
      console.error('Erro ao analisar imagem:', error);
      throw new Error('Erro ao analisar imagem: ' + error.message);
    }
  }
  
  /**
   * Enviar mensagem com RAG (busca em documentos)
   */
  async sendMessageWithRAG(
    messages: ChatMessage[],
    clientId: string,
    options: ChatOptions = {}
  ): Promise<{
    content: string;
    tokenCount: number;
    model: string;
    sources?: string[];
  }> {
    try {
      // Pegar a última mensagem do usuário
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      
      if (!lastUserMessage) {
        return this.sendMessage(messages, options);
      }
      
      // Buscar contexto relevante
      console.log('🔍 Buscando contexto relevante...');
      const ragContext = await ragService.searchRelevantContext(
        lastUserMessage.content,
        clientId,
        3 // top 3 chunks mais relevantes
      );
      
      // Se encontrou contexto relevante, adicionar ao system prompt
      if (ragContext.contextText) {
        console.log('✅ Contexto encontrado, adicionando à mensagem');
        
        const enhancedSystemPrompt = `${options.systemPrompt || ''}

## CONTEXTO DOS DOCUMENTOS:

Use as informações abaixo para responder a pergunta do usuário. Cite as fontes quando relevante.

${ragContext.contextText}

---

Responda a pergunta do usuário usando as informações acima quando relevante. Se a resposta estiver nos documentos, cite a fonte.`;
        
        const result = await this.sendMessage(messages, {
          ...options,
          systemPrompt: enhancedSystemPrompt
        });
        
        return {
          ...result,
          sources: ragContext.relevantChunks.map(c => c.source)
        };
      }
      
      // Se não encontrou contexto, enviar normalmente
      console.log('⚠️  Nenhum contexto relevante encontrado');
      return this.sendMessage(messages, options);
      
    } catch (error) {
      console.error('Erro no RAG, enviando mensagem sem contexto:', error);
      return this.sendMessage(messages, options);
    }
  }
  
  /**
   * Enviar mensagem e obter resposta (sem RAG)
   */
  async sendMessage(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<{
    content: string;
    tokenCount: number;
    model: string;
  }> {
    try {
      const {
        model = this.defaultModel,
        temperature = this.defaultTemperature,
        maxTokens = this.defaultMaxTokens,
        systemPrompt
      } = options;
      
      // Adicionar system prompt se fornecido
      const messagesWithSystem: ChatMessage[] = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;
      
      console.log('Enviando mensagem para OpenAI:', {
        model,
        messageCount: messagesWithSystem.length
      });
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: messagesWithSystem,
        temperature,
        max_tokens: maxTokens,
      });
      
      const content = response.choices[0]?.message?.content || '';
      const tokenCount = response.usage?.total_tokens || 0;
      
      console.log('Resposta recebida:', {
        contentLength: content.length,
        tokens: tokenCount
      });
      
      return {
        content,
        tokenCount,
        model
      };
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Tratar erros específicos da OpenAI
      if (error.status === 401) {
        throw new Error('Chave da API OpenAI inválida');
      } else if (error.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns segundos');
      } else if (error.status === 500) {
        throw new Error('Erro no servidor da OpenAI. Tente novamente');
      }
      
      throw new Error(error.message || 'Erro ao enviar mensagem');
    }
  }
  
  /**
   * Gerar título para conversa baseado nas mensagens
   */
  async generateConversationTitle(messages: ChatMessage[]): Promise<string> {
    try {
      const prompt = `Com base nesta conversa, gere um título curto e descritivo (máximo 6 palavras):

${messages.slice(0, 3).map(m => `${m.role}: ${m.content}`).join('\n')}

Responda apenas com o título, sem aspas ou pontuação extra.`;
      
      const response = await this.sendMessage(
        [{ role: 'user', content: prompt }],
        { temperature: 0.5, maxTokens: 20 }
      );
      
      return response.content.trim();
      
    } catch (error) {
      console.error('Erro ao gerar título:', error);
      return 'Nova conversa';
    }
  }
  
  /**
   * Criar prompt de sistema personalizado para um cliente
   */
  static createSystemPrompt(clientName: string, clientDescription?: string): string {
    return `Você é um assistente de IA especializado para ${clientName}.

${clientDescription ? `Informações sobre o cliente:\n${clientDescription}\n` : ''}

Suas responsabilidades:
- Responder perguntas sobre o cliente de forma precisa e útil
- Manter um tom profissional e cordial
- Usar informações dos documentos fornecidos quando relevante
- Admitir quando não souber algo ao invés de inventar informações

Sempre forneça respostas claras, objetivas e bem estruturadas.`;
  }
  
  /**
   * Estimar custo de uma conversa
   */
  static estimateCost(tokenCount: number, model: string = 'gpt-4o-mini'): number {
    // Preços por 1M tokens (aproximados)
    const prices: Record<string, { input: number; output: number }> = {
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
    };
    
    const price = prices[model] || prices['gpt-4o-mini'];
    
    // Estimativa simples (assumindo 50/50 input/output)
    const avgPrice = (price.input + price.output) / 2;
    
    return (tokenCount / 1_000_000) * avgPrice;
  }
}

export default ChatService;
