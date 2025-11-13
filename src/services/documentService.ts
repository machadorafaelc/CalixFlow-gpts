/**
 * Serviço de Gerenciamento de Documentos
 * 
 * Upload e gerenciamento de documentos no Firebase Storage e Firestore
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Document } from '../types/firestore';

export class DocumentService {
  private static COLLECTION = 'documents';
  
  /**
   * Upload de anexo de mensagem (chat)
   * Retorna a URL do arquivo no Storage
   */
  static async uploadChatAttachment(
    conversationId: string,
    file: File
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `chat/${conversationId}/attachments/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      console.log('Fazendo upload de anexo:', file.name);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('Anexo enviado:', downloadURL);
      
      return downloadURL;
      
    } catch (error) {
      console.error('Erro ao fazer upload de anexo:', error);
      throw new Error('Erro ao fazer upload do anexo');
    }
  }
  
  /**
   * Upload de documento
   */
  static async uploadDocument(
    clientId: string,
    file: File,
    metadata?: {
      description?: string;
      tags?: string[];
    }
  ): Promise<string> {
    try {
      // Upload para Storage
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `clients/${clientId}/documents/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      console.log('Fazendo upload do arquivo:', file.name);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Salvar metadados no Firestore
      const document: Omit<Document, 'id'> = {
        clientId,
        name: file.name,
        type: file.type,
        size: file.size,
        storagePath,
        downloadURL,
        uploadedAt: Timestamp.now(),
        description: metadata?.description,
        tags: metadata?.tags || [],
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), document);
      
      console.log('Documento salvo no Firestore:', docRef.id);
      
      return docRef.id;
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Erro ao fazer upload do documento');
    }
  }
  
  /**
   * Listar documentos de um cliente
   */
  static async listDocuments(clientId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('clientId', '==', clientId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const documents: Document[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        } as Document);
      });
      
      return documents;
      
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw new Error('Erro ao listar documentos');
    }
  }
  
  /**
   * Deletar documento
   */
  static async deleteDocument(documentId: string, storagePath: string): Promise<void> {
    try {
      // Deletar do Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      
      // Deletar do Firestore
      await deleteDoc(doc(db, this.COLLECTION, documentId));
      
      console.log('Documento deletado:', documentId);
      
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw new Error('Erro ao deletar documento');
    }
  }
  
  /**
   * Obter tipo de arquivo baseado na extensão
   */
  static getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    
    return types[ext || ''] || 'application/octet-stream';
  }
  
  /**
   * Formatar tamanho do arquivo
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default DocumentService;
