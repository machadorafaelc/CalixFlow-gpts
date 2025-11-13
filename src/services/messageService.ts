/**
 * Serviço de Gerenciamento de Mensagens
 * 
 * Gerencia mensagens individuais no Firestore
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types/firestore';

export class MessageService {
  private static COLLECTION = 'messages';
  
  /**
   * Adicionar mensagem
   */
  static async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: {
      attachments?: any[];
      documentsUsed?: string[];
      tokenCount?: number;
      model?: string;
    }
  ): Promise<string> {
    try {
      const message: Omit<Message, 'id'> = {
        conversationId,
        role,
        content,
        createdAt: Timestamp.now(),
        ...metadata
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), message);
      
      console.log('Mensagem adicionada:', docRef.id);
      
      return docRef.id;
      
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      throw new Error('Erro ao adicionar mensagem');
    }
  }
  
  /**
   * Listar mensagens de uma conversa
   */
  static async listMessages(conversationId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      
      return messages;
      
    } catch (error) {
      console.error('Erro ao listar mensagens:', error);
      throw new Error('Erro ao listar mensagens');
    }
  }
  
  /**
   * Observar mensagens em tempo real
   */
  static subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      
      callback(messages);
    });
  }
  
  /**
   * Formatar mensagens para OpenAI
   */
  static formatMessagesForOpenAI(messages: Message[]): Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  /**
   * Contar tokens aproximadamente
   */
  static estimateTokenCount(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }
}

export default MessageService;
