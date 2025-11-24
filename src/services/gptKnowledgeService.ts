/**
 * GPT Knowledge Service - Upload e processamento de documentos para GPTs
 * 
 * Funcionalidades:
 * - Upload de arquivos (PDF, DOC, TXT) para Firebase Storage
 * - Extração de texto dos documentos
 * - Geração de embeddings para busca semântica
 * - Cache de embeddings no Firestore
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface GPTDocument {
  id: string;
  gptId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  storagePath: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  processed: boolean;
  chunkCount?: number;
  processedAt?: Timestamp;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  gptId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  createdAt: Timestamp;
  similarity?: number;
}

/**
 * Faz upload de um documento para o Firebase Storage
 */
export async function uploadDocument(
  file: File,
  gptId: string,
  userId: string
): Promise<GPTDocument> {
  try {
    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.');
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
    }

    // Upload para Firebase Storage
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storagePath = `gpt-documents/${gptId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // Salvar metadados no Firestore
    const docRef = await addDoc(collection(db, 'gpt_documents'), {
      gptId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storageUrl: downloadUrl,
      storagePath,
      uploadedAt: Timestamp.now(),
      uploadedBy: userId,
      processed: false,
      chunkCount: 0
    });

    return {
      id: docRef.id,
      gptId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storageUrl: downloadUrl,
      storagePath,
      uploadedAt: Timestamp.now(),
      uploadedBy: userId,
      processed: false
    };
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    throw error;
  }
}

/**
 * Lista documentos de um GPT
 */
export async function listDocuments(gptId: string): Promise<GPTDocument[]> {
  try {
    const q = query(
      collection(db, 'gpt_documents'),
      where('gptId', '==', gptId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GPTDocument[];
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    throw error;
  }
}

/**
 * Deleta um documento
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // Buscar documento
    const docRef = doc(db, 'gpt_documents', documentId);
    const docQuery = query(
      collection(db, 'gpt_documents'),
      where('__name__', '==', documentId)
    );
    const docSnap = await getDocs(docQuery);
    
    if (docSnap.empty) {
      throw new Error('Documento não encontrado');
    }

    const docData = docSnap.docs[0].data();

    // Deletar do Storage
    if (docData.storagePath) {
      const storageRef = ref(storage, docData.storagePath);
      try {
        await deleteObject(storageRef);
      } catch (error) {
        console.warn('Erro ao deletar do storage:', error);
      }
    }

    // Deletar chunks
    const chunksQuery = query(
      collection(db, 'document_chunks'),
      where('documentId', '==', documentId)
    );
    const chunksSnapshot = await getDocs(chunksQuery);
    
    for (const chunkDoc of chunksSnapshot.docs) {
      await deleteDoc(chunkDoc.ref);
    }

    // Deletar documento
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
}

/**
 * Extrai texto de um arquivo
 * Nota: Para produção, usar biblioteca específica (pdf-parse, mammoth, etc)
 */
async function extractText(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return await file.text();
  }

  // Para PDF e DOC, retornar placeholder
  // Em produção, usar bibliotecas apropriadas
  return `[Conteúdo do arquivo ${file.name}]\n\nNota: Processamento completo de PDF/DOC será implementado em produção com bibliotecas específicas.`;
}

/**
 * Divide texto em chunks menores
 */
function splitIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if ((currentChunk + trimmedSentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text]; // Garantir pelo menos 1 chunk
}

/**
 * Gera embedding para um texto usando OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
}

/**
 * Processa um documento: extrai texto, divide em chunks e gera embeddings
 */
export async function processDocument(
  documentId: string,
  file: File
): Promise<void> {
  try {
    // Buscar documento
    const docQuery = query(
      collection(db, 'gpt_documents'),
      where('__name__', '==', documentId)
    );
    const docSnapshot = await getDocs(docQuery);
    
    if (docSnapshot.empty) {
      throw new Error('Documento não encontrado');
    }

    const docData = docSnapshot.docs[0].data();

    // Extrair texto
    const text = await extractText(file);

    // Dividir em chunks
    const chunks = splitIntoChunks(text);

    console.log(`Processando ${chunks.length} chunks do documento ${file.name}`);

    // Gerar embeddings e salvar chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);

      await addDoc(collection(db, 'document_chunks'), {
        documentId,
        gptId: docData.gptId,
        content: chunk,
        embedding,
        chunkIndex: i,
        createdAt: Timestamp.now()
      });
    }

    // Atualizar documento como processado
    await updateDoc(doc(db, 'gpt_documents', documentId), {
      processed: true,
      chunkCount: chunks.length,
      processedAt: Timestamp.now()
    });

    console.log(`Documento ${file.name} processado com sucesso!`);

  } catch (error) {
    console.error('Erro ao processar documento:', error);
    throw error;
  }
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
function cosineSimilarity(a: number[], b: number[]): number {
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
 * Busca chunks relevantes para uma query usando similaridade de embeddings
 */
export async function searchRelevantChunks(
  gptId: string,
  queryText: string,
  topK: number = 5
): Promise<DocumentChunk[]> {
  try {
    // Gerar embedding da query
    const queryEmbedding = await generateEmbedding(queryText);

    // Buscar todos os chunks do GPT
    const chunksQuery = query(
      collection(db, 'document_chunks'),
      where('gptId', '==', gptId)
    );
    const chunksSnapshot = await getDocs(chunksQuery);

    if (chunksSnapshot.empty) {
      return [];
    }

    // Calcular similaridade de cosseno
    const chunksWithSimilarity = chunksSnapshot.docs.map(doc => {
      const data = doc.data();
      const similarity = cosineSimilarity(queryEmbedding, data.embedding);
      
      return {
        id: doc.id,
        ...data,
        similarity
      };
    });

    // Ordenar por similaridade e retornar top K
    return chunksWithSimilarity
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, topK) as DocumentChunk[];

  } catch (error) {
    console.error('Erro ao buscar chunks relevantes:', error);
    return [];
  }
}

/**
 * Obtém contexto relevante dos documentos para uma query
 */
export async function getRelevantContext(
  gptId: string,
  queryText: string
): Promise<string> {
  try {
    const relevantChunks = await searchRelevantChunks(gptId, queryText, 3);

    if (relevantChunks.length === 0) {
      return '';
    }

    const context = relevantChunks
      .map((chunk, index) => `[Documento ${index + 1}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    return `CONHECIMENTO BASE:\n\n${context}`;

  } catch (error) {
    console.error('Erro ao obter contexto relevante:', error);
    return '';
  }
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
