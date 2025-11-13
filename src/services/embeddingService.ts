import OpenAI from 'openai';

// Suporta tanto browser quanto Node.js
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  return process.env.VITE_OPENAI_API_KEY;
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true
});

export interface DocumentChunk {
  id: string;
  clientId: string;
  documentId: string;
  documentName: string;
  content: string;
  embedding?: number[];
  metadata?: {
    pageNumber?: number;
    section?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  chunk: DocumentChunk;
  similarity: number;
}

class EmbeddingService {
  private readonly EMBEDDING_MODEL = 'text-embedding-3-small';
  private readonly CHUNK_SIZE = 1000; // caracteres por chunk
  private readonly CHUNK_OVERLAP = 200; // overlap entre chunks
  
  /**
   * Gera embedding para um texto usando OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      throw error;
    }
  }
  
  /**
   * Divide um documento em chunks menores
   */
  chunkDocument(
    documentId: string,
    documentName: string,
    content: string,
    clientId: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const sentences = content.split(/[.!?]\s+/);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > this.CHUNK_SIZE && currentChunk.length > 0) {
        // Salvar chunk atual
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          clientId,
          documentId,
          documentName,
          content: currentChunk.trim(),
          metadata: {
            chunkIndex,
            totalChunks: 0 // será atualizado depois
          }
        });
        
        // Começar novo chunk com overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(this.CHUNK_OVERLAP / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    // Adicionar último chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        clientId,
        documentId,
        documentName,
        content: currentChunk.trim(),
        metadata: {
          chunkIndex,
          totalChunks: 0
        }
      });
    }
    
    // Atualizar totalChunks
    chunks.forEach(chunk => {
      if (chunk.metadata) {
        chunk.metadata.totalChunks = chunks.length;
      }
    });
    
    return chunks;
  }
  
  /**
   * Processa um documento: divide em chunks e gera embeddings
   */
  async processDocument(
    documentId: string,
    documentName: string,
    content: string,
    clientId: string
  ): Promise<DocumentChunk[]> {
    console.log(`Processando documento: ${documentName}`);
    
    // Dividir em chunks
    const chunks = this.chunkDocument(documentId, documentName, content, clientId);
    console.log(`Documento dividido em ${chunks.length} chunks`);
    
    // Gerar embeddings para cada chunk
    const chunksWithEmbeddings: DocumentChunk[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Gerando embedding para chunk ${i + 1}/${chunks.length}`);
      
      try {
        const embedding = await this.generateEmbedding(chunk.content);
        chunksWithEmbeddings.push({
          ...chunk,
          embedding
        });
        
        // Rate limiting: aguardar 100ms entre requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Erro ao processar chunk ${i}:`, error);
        // Continuar com próximo chunk
      }
    }
    
    return chunksWithEmbeddings;
  }
  
  /**
   * Calcula similaridade de cosseno entre dois vetores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vetores devem ter o mesmo tamanho');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Busca chunks mais relevantes para uma query
   */
  async searchSimilarChunks(
    query: string,
    chunks: DocumentChunk[],
    topK: number = 3
  ): Promise<SearchResult[]> {
    // Gerar embedding da query
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Calcular similaridade com cada chunk
    const results: SearchResult[] = [];
    
    for (const chunk of chunks) {
      if (!chunk.embedding) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({ chunk, similarity });
    }
    
    // Ordenar por similaridade (maior primeiro) e retornar top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
  
  /**
   * Estima custo de processamento
   */
  estimateProcessingCost(textLength: number): number {
    // text-embedding-3-small: $0.02 / 1M tokens
    // Aproximadamente 1 token = 4 caracteres
    const tokens = textLength / 4;
    const cost = (tokens / 1_000_000) * 0.02;
    return cost;
  }
}

export default new EmbeddingService();
