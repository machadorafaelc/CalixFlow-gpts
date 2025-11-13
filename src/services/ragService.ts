import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { db } from '../config/firebase';
import embeddingService, { DocumentChunk } from './embeddingService';

export interface RAGContext {
  relevantChunks: Array<{
    content: string;
    source: string;
    similarity: number;
  }>;
  contextText: string;
}

class RAGService {
  private documentCache: Map<string, DocumentChunk[]> = new Map();
  
  /**
   * Carrega documentos de um cliente e divide em chunks
   */
  async loadClientDocuments(clientId: string): Promise<DocumentChunk[]> {
    // Verificar cache
    if (this.documentCache.has(clientId)) {
      return this.documentCache.get(clientId)!;
    }
    
    try {
      console.log(`Carregando documentos do cliente: ${clientId}`);
      
      // Buscar documentos do Firestore
      const documentsRef = collection(db, `clients/${clientId}/documents`);
      const documentsSnapshot = await getDocs(documentsRef);
      
      const allChunks: DocumentChunk[] = [];
      
      // Processar cada documento
      for (const docSnapshot of documentsSnapshot.docs) {
        const document = docSnapshot.data();
        
        if (!document.content) continue;
        
        console.log(`Processando: ${document.name}`);
        
        // Dividir em chunks (sem gerar embeddings ainda)
        const chunks = embeddingService.chunkDocument(
          docSnapshot.id,
          document.name,
          document.content,
          clientId
        );
        
        allChunks.push(...chunks);
      }
      
      console.log(`Total de chunks: ${allChunks.length}`);
      
      // Salvar no cache
      this.documentCache.set(clientId, allChunks);
      
      return allChunks;
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      return [];
    }
  }
  
  /**
   * Busca contexto relevante para uma query usando RAG
   */
  async searchRelevantContext(
    query: string,
    clientId: string,
    topK: number = 3
  ): Promise<RAGContext> {
    try {
      console.log(`🔍 Buscando contexto para: "${query}"`);
      
      // Carregar documentos
      const chunks = await this.loadClientDocuments(clientId);
      
      if (chunks.length === 0) {
        console.log('⚠️  Nenhum documento encontrado');
        return {
          relevantChunks: [],
          contextText: ''
        };
      }
      
      // Gerar embedding da query
      console.log('Gerando embedding da query...');
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      // Calcular similaridade com cada chunk
      const results: Array<{ chunk: DocumentChunk; similarity: number }> = [];
      
      for (const chunk of chunks) {
        // Gerar embedding do chunk se não existir
        if (!chunk.embedding) {
          chunk.embedding = await embeddingService.generateEmbedding(chunk.content);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Calcular similaridade
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        results.push({ chunk, similarity });
      }
      
      // Ordenar por similaridade e pegar top K
      const topResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
      console.log(`✅ Encontrados ${topResults.length} chunks relevantes`);
      topResults.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.chunk.documentName} (${(result.similarity * 100).toFixed(1)}%)`);
      });
      
      // Formatar contexto
      const relevantChunks = topResults.map(result => ({
        content: result.chunk.content,
        source: result.chunk.documentName,
        similarity: result.similarity
      }));
      
      const contextText = topResults
        .map((result, i) => {
          return `[Fonte ${i + 1}: ${result.chunk.documentName}]\n${result.chunk.content}`;
        })
        .join('\n\n---\n\n');
      
      return {
        relevantChunks,
        contextText
      };
    } catch (error) {
      console.error('Erro ao buscar contexto:', error);
      return {
        relevantChunks: [],
        contextText: ''
      };
    }
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
   * Limpa cache de documentos
   */
  clearCache(clientId?: string) {
    if (clientId) {
      this.documentCache.delete(clientId);
    } else {
      this.documentCache.clear();
    }
  }
}

export default new RAGService();
