/**
 * Serviço de Upload de Anexos
 * 
 * Gerencia upload de arquivos (imagens, PDFs) para Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { MessageAttachment } from '../types/firestore';

export class AttachmentService {
  /**
   * Upload de arquivo para Firebase Storage
   */
  static async uploadFile(
    file: File,
    conversationId: string,
    messageId: string
  ): Promise<MessageAttachment> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, WEBP) ou PDF.');
      }
      
      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }
      
      // Criar referência no Storage
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `attachments/${conversationId}/${messageId}/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);
      
      console.log('Fazendo upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        path: storagePath
      });
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type
      });
      
      // Obter URL de download
      const url = await getDownloadURL(snapshot.ref);
      
      console.log('Upload concluído:', url);
      
      // Retornar attachment
      const attachment: MessageAttachment = {
        name: file.name,
        type: file.type,
        size: file.size,
        url
      };
      
      return attachment;
      
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      throw new Error(error.message || 'Erro ao fazer upload do arquivo');
    }
  }
  
  /**
   * Upload de múltiplos arquivos
   */
  static async uploadFiles(
    files: File[],
    conversationId: string,
    messageId: string
  ): Promise<MessageAttachment[]> {
    const attachments: MessageAttachment[] = [];
    
    for (const file of files) {
      try {
        const attachment = await this.uploadFile(file, conversationId, messageId);
        attachments.push(attachment);
      } catch (error: any) {
        console.error(`Erro ao fazer upload de ${file.name}:`, error);
        // Continuar com os outros arquivos
      }
    }
    
    return attachments;
  }
  
  /**
   * Deletar arquivo do Storage
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      console.log('Arquivo deletado:', url);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      // Não lançar erro, pois pode ser que o arquivo já foi deletado
    }
  }
  
  /**
   * Verificar se arquivo é imagem
   */
  static isImage(type: string): boolean {
    return type.startsWith('image/');
  }
  
  /**
   * Verificar se arquivo é PDF
   */
  static isPDF(type: string): boolean {
    return type === 'application/pdf';
  }
  
  /**
   * Formatar tamanho de arquivo
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Obter ícone para tipo de arquivo
   */
  static getFileIcon(type: string): string {
    if (this.isImage(type)) return '🖼️';
    if (this.isPDF(type)) return '📄';
    return '📎';
  }
}

export default AttachmentService;
